import mimetypes
import os

from django.http import FileResponse, Http404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Document
from .serializers import (
    DocumentSerializer,
    DocumentUploadSerializer,
    ClientDocumentUploadSerializer,
)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing documents.

    Admin:  Upload to any consignment or directly to a client account,
            view all, delete any.
    Staff:  Read-only access to all documents.
    Client: Read-only — sees documents for their own consignments AND
            documents uploaded directly to their client profile.
    """

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # ------------------------------------------------------------------ #
    # Queryset & serializer selection                                      #
    # ------------------------------------------------------------------ #

    def get_queryset(self):
        user = self.request.user
        base = Document.objects.select_related(
            'consignment', 'client', 'uploaded_by'
        )
        if user.role in ('admin', 'staff'):
            return base.all()
        # Client: documents for their consignments OR directly on their profile
        return base.filter(
            consignment__client__user=user
        ) | base.filter(
            client__user=user
        )

    def get_serializer_class(self):
        if self.action in ('create', 'upload_to_client'):
            return DocumentUploadSerializer
        return DocumentSerializer

    # ------------------------------------------------------------------ #
    # Mutation guards                                                      #
    # ------------------------------------------------------------------ #

    def create(self, request, *args, **kwargs):
        """Upload a document — admin only."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can upload documents.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = DocumentUploadSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            document = serializer.save()
            return Response(
                DocumentSerializer(document, context={'request': request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        """Delete a document — admin only."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can delete documents.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Update document description — admin only."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can update documents.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    # ------------------------------------------------------------------ #
    # Download — authenticated, forces browser Save-As dialog             #
    # ------------------------------------------------------------------ #

    @action(detail=True, methods=['get'], url_path='download')
    def download(self, request, pk=None):
        """
        Authenticated file download.

        Returns the raw file bytes with:
          Content-Disposition: attachment; filename="<original_name>"
        so the browser shows a Save-As dialog instead of opening inline.

        Access control is enforced by get_queryset — clients can only
        download their own documents.
        """
        document = self.get_object()   # raises 403/404 if not permitted

        file_field = document.file_path
        if not file_field or not file_field.name:
            raise Http404('File not found.')

        try:
            file_handle = file_field.open('rb')
        except (FileNotFoundError, OSError):
            raise Http404('File not found on server.')

        # Guess MIME type from extension; fall back to octet-stream
        filename = os.path.basename(file_field.name)
        mime_type, _ = mimetypes.guess_type(filename)
        if not mime_type:
            mime_type = 'application/octet-stream'

        response = FileResponse(
            file_handle,
            content_type=mime_type,
            as_attachment=True,       # sets Content-Disposition: attachment
            filename=filename,
        )

        # Expose the header so the browser honours it cross-origin
        response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response

    # ------------------------------------------------------------------ #
    # Custom read actions                                                  #
    # ------------------------------------------------------------------ #

    @action(
        detail=False,
        methods=['get'],
        url_path=r'by-consignment/(?P<consignment_id>[^/.]+)',
    )
    def by_consignment(self, request, consignment_id=None):
        """All documents for a specific consignment."""
        queryset = self.get_queryset().filter(consignment_id=consignment_id)
        serializer = DocumentSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get'],
        url_path=r'by-client/(?P<client_id>[^/.]+)',
    )
    def by_client(self, request, client_id=None):
        """
        All documents attached directly to a client (not via a consignment).
        Admin / staff: any client.
        Client: only their own.
        """
        user = request.user
        if user.role == 'client':
            try:
                if str(user.client_profile.id) != str(client_id):
                    return Response(
                        {'detail': 'Not permitted.'},
                        status=status.HTTP_403_FORBIDDEN,
                    )
            except AttributeError:
                return Response(
                    {'detail': 'Client profile not found.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        queryset = Document.objects.filter(client_id=client_id).select_related(
            'consignment', 'client', 'uploaded_by'
        )
        serializer = DocumentSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get'],
        url_path='my-documents',
    )
    def my_documents(self, request):
        """
        All documents visible to the current client:
        - Documents on their consignments
        - Documents uploaded directly to their client profile
        """
        user = request.user
        if user.role != 'client':
            return Response(
                {'detail': 'This endpoint is for clients only.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        try:
            client = user.client_profile
        except AttributeError:
            return Response([], status=status.HTTP_200_OK)

        consignment_docs = Document.objects.filter(
            consignment__client=client
        ).select_related('consignment', 'client', 'uploaded_by')

        client_docs = Document.objects.filter(
            client=client
        ).select_related('consignment', 'client', 'uploaded_by')

        all_docs = (consignment_docs | client_docs).distinct().order_by('-upload_date')
        serializer = DocumentSerializer(all_docs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['post'],
        url_path='upload-to-client',
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_to_client(self, request):
        """
        Admin-only: upload a document directly to a client account
        (without tying it to a specific consignment).

        Required fields: client (ID), document_type, file
        Optional:        description
        """
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only administrators can upload client documents.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = ClientDocumentUploadSerializer(
            data=request.data, context={'request': request}
        )
        if serializer.is_valid():
            document = serializer.save()
            return Response(
                DocumentSerializer(document, context={'request': request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
