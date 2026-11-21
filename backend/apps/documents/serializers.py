from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    """Full serializer for reading documents."""

    uploaded_by_email = serializers.SerializerMethodField()
    document_type_display = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    # Convenience read fields
    client_name = serializers.SerializerMethodField()
    consignment_number = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            'id',
            'consignment', 'consignment_number',
            'client', 'client_name',
            'document_type', 'document_type_display',
            'description',
            'file_name', 'file_path', 'file_url', 'file_size',
            'uploaded_by', 'uploaded_by_email',
            'upload_date',
        ]
        read_only_fields = ['id', 'upload_date', 'uploaded_by', 'file_size', 'file_name']

    def get_uploaded_by_email(self, obj):
        return obj.uploaded_by.email if obj.uploaded_by else None

    def get_document_type_display(self, obj):
        return obj.get_document_type_display()

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file_path and request:
            return request.build_absolute_uri(obj.file_path.url)
        return None

    def get_client_name(self, obj):
        if obj.client:
            return obj.client.full_name
        if obj.consignment:
            return obj.consignment.client.full_name
        return None

    def get_consignment_number(self, obj):
        return obj.consignment.consignment_number if obj.consignment else None


class DocumentUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading documents (admin only).

    Accepts either `consignment` (ID) or `client` (ID), not both.
    """

    file = serializers.FileField(write_only=True)

    class Meta:
        model = Document
        fields = ['consignment', 'client', 'document_type', 'description', 'file']

    def validate(self, data):
        consignment = data.get('consignment')
        client = data.get('client')
        if not consignment and not client:
            raise serializers.ValidationError(
                'Either consignment or client must be provided.'
            )
        if consignment and client:
            raise serializers.ValidationError(
                'Provide either consignment or client, not both.'
            )
        return data

    def create(self, validated_data):
        file = validated_data.pop('file')
        validated_data['file_name'] = file.name
        validated_data['file_path'] = file
        validated_data['file_size'] = file.size
        validated_data['uploaded_by'] = self.context['request'].user
        return Document.objects.create(**validated_data)


class ClientDocumentUploadSerializer(serializers.ModelSerializer):
    """Convenience serializer — client field is required, consignment must be absent."""

    file = serializers.FileField(write_only=True)

    class Meta:
        model = Document
        fields = ['client', 'document_type', 'description', 'file']

    def create(self, validated_data):
        file = validated_data.pop('file')
        validated_data['file_name'] = file.name
        validated_data['file_path'] = file
        validated_data['file_size'] = file.size
        validated_data['uploaded_by'] = self.context['request'].user
        return Document.objects.create(**validated_data)
