# Document Upload Integration Guide

## How to Add Document Upload to Admin Pages

The `DocumentUploadModal` component is ready to use in any admin page that manages consignments.

## Quick Integration

### 1. Import the Component

```javascript
import DocumentUploadModal from '../../components/common/DocumentUploadModal';
```

### 2. Add State Management

```javascript
const [showUploadModal, setShowUploadModal] = useState(false);
const [selectedConsignmentForUpload, setSelectedConsignmentForUpload] = useState(null);
```

### 3. Add Upload Button

```javascript
<button
  onClick={() => {
    setSelectedConsignmentForUpload(consignment.id);
    setShowUploadModal(true);
  }}
  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
>
  <FaFileUpload />
  Upload Document
</button>
```

### 4. Add Modal Component

```javascript
<DocumentUploadModal
  isOpen={showUploadModal}
  onClose={() => setShowUploadModal(false)}
  consignmentId={selectedConsignmentForUpload}
  onUploadSuccess={(doc) => {
    console.log('Document uploaded:', doc);
    // Optionally refresh document list
    fetchDocuments();
  }}
/>
```

## Complete Example: ConsignmentDetailPage

```javascript
import React, { useState, useEffect } from 'react';
import { FaFileUpload, FaFileAlt } from 'react-icons/fa';
import DocumentUploadModal from '../../components/common/DocumentUploadModal';
import { consignmentApi, documentApi } from '../../services/assetApi';

const ConsignmentDetailPage = ({ consignmentId }) => {
  const [consignment, setConsignment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchConsignment();
    fetchDocuments();
  }, [consignmentId]);

  const fetchConsignment = async () => {
    const data = await consignmentApi.getConsignment(consignmentId);
    setConsignment(data);
  };

  const fetchDocuments = async () => {
    const data = await documentApi.getConsignmentDocuments(consignmentId);
    setDocuments(data);
  };

  const handleUploadSuccess = (uploadedDoc) => {
    console.log('Document uploaded successfully:', uploadedDoc);
    // Refresh document list
    fetchDocuments();
  };

  return (
    <div>
      {/* Consignment Details */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          {consignment?.consignment_number}
        </h2>
        
        {/* Upload Button */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition flex items-center gap-2"
        >
          <FaFileUpload />
          Upload Document
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaFileAlt className="text-cyan-400" />
          Documents ({documents.length})
        </h3>
        
        {documents.map((doc) => (
          <div key={doc.id} className="border-b border-gray-700 py-3">
            <p className="text-white font-semibold">{doc.file_name}</p>
            <p className="text-sm text-gray-400">{doc.description}</p>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        consignmentId={consignmentId}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default ConsignmentDetailPage;
```

## Props Reference

### DocumentUploadModal Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | function | Yes | Called when modal should close |
| `consignmentId` | number/string | Yes | ID of consignment to attach document to |
| `onUploadSuccess` | function | No | Called with uploaded document data on success |

## Document Types Available

The modal provides these document type options:

- **invoice** - Invoice
- **receipt** - Receipt  
- **contract** - Contract
- **certificate** - Certificate
- **appraisal** - Appraisal
- **insurance** - Insurance
- **customs** - Customs Document
- **other** - Other

## File Upload Specifications

- **Max File Size:** 10MB
- **Allowed Formats:** 
  - Documents: `.pdf`, `.doc`, `.docx`
  - Spreadsheets: `.xlsx`, `.xls`
  - Images: `.jpg`, `.jpeg`, `.png`

## API Endpoint Used

```
POST /api/documents/
Content-Type: multipart/form-data

FormData:
- consignment: <consignment_id>
- document_type: <type>
- description: <description>
- file: <file_object>
```

## Error Handling

The modal handles these errors automatically:

- File too large (> 10MB)
- Missing description
- Missing file
- Network errors
- API errors

Errors are displayed in a user-friendly format within the modal.

## Styling

The modal uses Tailwind CSS with the project's color scheme:

- Primary: Cyan (`cyan-600`, `cyan-400`)
- Background: Gray (`gray-900`, `gray-800`)
- Borders: Gray with transparency
- Icons: React Icons (Font Awesome)

## Pages Where This Should Be Added

Recommended admin pages to integrate document upload:

1. **ConsignmentsPage** - Upload documents for each consignment
2. **ConsignmentDetailPage** - Main upload location
3. **ValuationsPage** - Upload appraisal documents
4. **LogisticsPage** - Upload shipping documents
5. **CustodyPage** - Upload custody documentation

## Example: Adding to ConsignmentsPage

```javascript
// In ConsignmentsPage.jsx
import DocumentUploadModal from '../../components/common/DocumentUploadModal';

// Inside component
const [uploadModalOpen, setUploadModalOpen] = useState(false);
const [selectedConsignmentId, setSelectedConsignmentId] = useState(null);

// In consignment table/card actions
<button
  onClick={() => {
    setSelectedConsignmentId(consignment.id);
    setUploadModalOpen(true);
  }}
  className="text-cyan-400 hover:text-cyan-300"
  title="Upload Document"
>
  <FaFileUpload />
</button>

// At end of component
<DocumentUploadModal
  isOpen={uploadModalOpen}
  onClose={() => setUploadModalOpen(false)}
  consignmentId={selectedConsignmentId}
  onUploadSuccess={() => {
    // Refresh consignment list or show success message
    alert('Document uploaded successfully!');
  }}
/>
```

## Testing the Integration

1. **Open the page** with document upload button
2. **Click Upload Document**
3. **Modal should appear** with form fields
4. **Select document type** from dropdown
5. **Enter description** (required)
6. **Choose file** (click or drag-and-drop)
7. **Click Upload Document** button
8. **Success message** should appear
9. **Modal closes** automatically after 1.5 seconds
10. **Document appears** in client's Documents page

## Troubleshooting

### Modal doesn't open
- Check that `isOpen` state is being set to `true`
- Verify modal component is rendered

### Upload fails
- Check browser console for errors
- Verify `consignmentId` is valid and exists
- Check that backend endpoint is accessible
- Ensure authentication token is valid

### File not accepted
- Check file size (must be < 10MB)
- Verify file extension is in allowed list
- Try a different file format

### Modal styling looks wrong
- Ensure Tailwind CSS is loaded
- Check for CSS conflicts
- Verify all icon imports are working

---

**Ready to Use:** Yes ✅
**Testing Status:** Component tested and working
**Documentation:** Complete
