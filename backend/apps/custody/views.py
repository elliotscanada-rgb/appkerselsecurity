from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import CustodyRecord
from .serializers import CustodyRecordSerializer, CustodyTransferSerializer


class CustodyRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for custody records.

    GET  /api/custody/records/              - List all custody records
    GET  /api/custody/records/{id}/         - Get single record
    POST /api/custody/transfer/             - Record new custody transfer
    GET  /api/custody/by_consignment/?consignment_id=X  - Get chain for one item
    """
    serializer_class = CustodyRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustodyRecord.objects.select_related(
            'consignment',
            'previous_custodian',
            'new_custodian',
        ).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='transfer')
    def transfer(self, request):
        """Record a new custody transfer."""
        if request.user.role not in ['admin', 'staff']:
            return Response(
                {'detail': 'Only admin and staff can record custody transfers.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CustodyTransferSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        from apps.consignments.models import Consignment
        from apps.staff.models import Staff

        consignment = Consignment.objects.get(id=data['consignment_id'])
        new_custodian = Staff.objects.get(id=data['new_custodian_id'])

        # Get current custodian (last custody record's new_custodian)
        last_record = CustodyRecord.objects.filter(
            consignment=consignment
        ).order_by('-created_at').first()

        previous_custodian = last_record.new_custodian if last_record else None
        previous_location = consignment.current_location or ''

        # Create custody record
        record = CustodyRecord.objects.create(
            consignment=consignment,
            previous_custodian=previous_custodian,
            new_custodian=new_custodian,
            previous_location=previous_location,
            new_location=data['new_location'],
            notes=data.get('notes', ''),
        )

        # Update consignment's current location
        consignment.current_location = data['new_location']
        consignment.save(update_fields=['current_location'])

        # Create audit log entry
        try:
            from apps.audit.models import AuditLog
            AuditLog.objects.create(
                user=request.user,
                action='custody_transfer',
                table_name='custody_records',
                record_id=record.id,
                new_value={
                    'consignment': consignment.consignment_number,
                    'new_custodian': new_custodian.full_name,
                    'new_location': data['new_location'],
                    'notes': data.get('notes', ''),
                },
            )
        except Exception:
            pass  # Audit log failure should not block the transfer

        return Response(
            CustodyRecordSerializer(record).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='by_consignment')
    def by_consignment(self, request):
        """Get the full custody chain for a specific consignment."""
        consignment_id = request.query_params.get('consignment_id')
        if not consignment_id:
            return Response(
                {'detail': 'consignment_id query parameter is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        records = self.get_queryset().filter(consignment_id=consignment_id)
        serializer = CustodyRecordSerializer(records, many=True)
        return Response(serializer.data)
