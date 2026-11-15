from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing documents.

    Admin: Can upload, view, and delete documents for any consignment.
    Client/Staff: Can only view documents for their consignments.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Document.objects.all().select_related('consignment', 'uploaded_by')
        elif user.role == 'staff':
            return Document.objects.all().select_related('consignment', 'uploaded_by')
        else:
            # Client sees only documents for their own consignments
            return Document.objects.filter(
                consignment__client__user=user
            ).select_related('consignment', 'uploaded_by')

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'upload':
            return DocumentUploadSerializer
        return DocumentSerializer

    def create(self, request, *args, **kwargs):
        """Upload a document — admin only."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can upload documents.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = DocumentUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            document = serializer.save()
            return Response(
                DocumentSerializer(document, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Delete a document — admin only."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can delete documents.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update document description — admin only."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can update documents.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=['get'], url_path='by-consignment/(?P<consignment_id>[^/.]+)')
    def by_consignment(self, request, consignment_id=None):
        """Get all documents for a specific consignment."""
        queryset = self.get_queryset().filter(consignment_id=consignment_id)
        serializer = DocumentSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
