import { useEffect, useState } from "react";
import "./AssetUpload.css";
import { useAppSdk } from "../../common/hooks/useAppSdk";
import { Folder, Loader2, ArrowLeft, Home, File, FileImage, FileVideo, FileText } from "lucide-react";
import stack from "../../services/managementSDK";

interface AssetItem {
  uid: string;
  name: string;
  title?: string;
  filename?: string;
  parent_uid?: string;
  is_dir?: boolean;
  content_type?: string;
  url?: string;
}

interface Breadcrumb {
  uid: string | null;
  name: string;
}

const AssetUploadExtension = () => {
  const appSdk = useAppSdk();
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFolderUid, setCurrentFolderUid] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ uid: null, name: 'Root' }]);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    const initFrame = async () => {
      if (appSdk?.location?.DashboardWidget?.frame) {
        appSdk.location.DashboardWidget.frame.disableAutoResizing();
        await appSdk.location.DashboardWidget.frame.updateHeight(400);
      }
    };
    
    initFrame();
  }, [appSdk]);

  useEffect(() => {
    fetchFolders(currentFolderUid);
  }, [currentFolderUid]);

  const fetchFolders = async (folderUid: string | null) => {
    try {
      setLoading(true);
      
      // Build query based on current folder
      const query: any = { include_folders: true };
      
      if (folderUid) {
        // Fetch contents of specific folder
        query.folder = folderUid;
      }
      
      const response = await stack.asset().query(query).find();
      
      // The response should contain both assets and folders
      const allItems = response.items || response.assets || [];
      
      // Separate folders and files
      const folders: AssetItem[] = [];
      const files: AssetItem[] = [];
      
      allItems.forEach((item: any) => {
        const isFolder = item.is_dir === true || 
                        item.content_type === 'folder' ||
                        item._content_type_uid === 'folder' ||
                        !item.filename;
        
        if (isFolder) {
          folders.push(item);
        } else {
          files.push(item);
        }
      });
      
      // Sort folders and files alphabetically
      const sortByName = (a: any, b: any) => {
        const nameA = (a.name || a.title || a.filename || '').toLowerCase();
        const nameB = (b.name || b.title || b.filename || '').toLowerCase();
        return nameA.localeCompare(nameB);
      };
      
      folders.sort(sortByName);
      files.sort(sortByName);
      
      // Combine folders first, then files
      setItems([...folders, ...files]);
      setError(null);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: AssetItem) => {
    const isFolder = item.is_dir === true || 
                     item.content_type === 'folder' ||
                     !item.filename;
    
    if (isFolder) {
      // Navigate into the folder
      setCurrentFolderUid(item.uid);
      setBreadcrumbs([...breadcrumbs, { uid: item.uid, name: item.name }]);
    } else {
      // Open file in new tab
      if (item.url) {
        window.open(item.url, '_blank');
      }
    }
  };

  const getFileIcon = (item: AssetItem) => {
    const contentType = item.content_type || '';
    
    if (contentType.startsWith('image/')) {
      return <FileImage className="w-6 h-6 text-blue-600" />;
    } else if (contentType.startsWith('video/')) {
      return <FileVideo className="w-6 h-6 text-purple-600" />;
    } else if (contentType.includes('pdf') || contentType.includes('document')) {
      return <FileText className="w-6 h-6 text-red-600" />;
    } else {
      return <File className="w-6 h-6 text-gray-600" />;
    }
  };

  const getItemIconBg = (item: AssetItem) => {
    const isFolder = item.is_dir === true || item.content_type === 'folder' || !item.filename;
    
    if (isFolder) return 'bg-amber-100';
    
    const contentType = item.content_type || '';
    if (contentType.startsWith('image/')) return 'bg-blue-100';
    if (contentType.startsWith('video/')) return 'bg-purple-100';
    if (contentType.includes('pdf') || contentType.includes('document')) return 'bg-red-100';
    return 'bg-gray-100';
  };

  const handleDragOver = (e: React.DragEvent, item: AssetItem) => {
    const isFolder = item.is_dir === true || item.content_type === 'folder' || !item.filename;
    
    // Only allow dropping on folders
    if (!isFolder) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(item.uid);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolder: AssetItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    
    const isFolder = targetFolder.is_dir === true || targetFolder.content_type === 'folder' || !targetFolder.filename;
    if (!isFolder) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      for (const file of files) {
        // Create FormData for the upload
        const uploadData: any = {
          asset: {
            upload: file,
            parent_uid: targetFolder.uid,
            title: file.name
          }
        };
        
        // Upload using Management SDK - proper method
        try {
          await stack.asset().create(uploadData);
        } catch (uploadErr) {
          console.error('Upload error for file:', file.name, uploadErr);
          // Try alternative method
          const formData = new FormData();
          formData.append('asset[upload]', file);
          formData.append('asset[parent_uid]', targetFolder.uid);
          formData.append('asset[title]', file.name);
          
          // Direct API call as fallback
          const apiKey = import.meta.env.VITE_CONTENTSTACK_API_KEY;
          const managementToken = import.meta.env.VITE_CONTENTSTACK_MANAGEMENT_TOKEN;
          
          const response = await fetch(`https://api.contentstack.io/v3/assets`, {
            method: 'POST',
            headers: {
              'api_key': apiKey,
              'authorization': managementToken,
            },
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
        }
      }
      
      // Show success message
      const fileNames = files.map(f => f.name).join(', ');
      setUploadSuccess(`Uploaded ${files.length} file(s) to "${targetFolder.name}": ${fileNames}`);
      setTimeout(() => setUploadSuccess(null), 5000);
      
      // Refresh the current view
      await fetchFolders(currentFolderUid);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(`Failed to upload files: ${err}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    // Navigate to a specific breadcrumb level
    const crumb = breadcrumbs[index];
    setCurrentFolderUid(crumb.uid);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleBackClick = () => {
    if (breadcrumbs.length > 1) {
      const newBreadcrumbs = breadcrumbs.slice(0, -1);
      const parentCrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
      setCurrentFolderUid(parentCrumb.uid);
      setBreadcrumbs(newBreadcrumbs);
    }
  };

  if (loading) {
    return (
      <div style={{ overflow: 'hidden' }}>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ overflow: 'hidden' }}>
        <div className="p-5 text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Upload Success Message */}
      {uploadSuccess && (
        <div className="mx-5 mt-3 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {uploadSuccess}
        </div>
      )}
      
      {/* Uploading Indicator */}
      {uploading && (
        <div className="mx-5 mt-3 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Uploading files...
        </div>
      )}
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 px-5 pt-3 pb-2 border-b border-gray-200">
        {breadcrumbs.length > 1 && (
          <button
            onClick={handleBackClick}
            className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <div className="flex items-center gap-1 text-sm text-gray-600 flex-1">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => handleBreadcrumbClick(index)}
                className={`hover:text-blue-600 transition-colors ${
                  index === breadcrumbs.length - 1 ? 'font-semibold text-gray-900' : ''
                }`}
              >
                {index === 0 ? (
                  <Home className="w-4 h-4" />
                ) : (
                  crumb.name
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-8 gap-4 p-5">
        {/* Assets and Folders */}
        {items.length === 0 && !loading && (
          <div className="col-span-8 p-5 text-center text-gray-500">
            No items in this directory
          </div>
        )}
        {items.map((item) => {
          const isFolder = item.is_dir === true || item.content_type === 'folder' || !item.filename;
          const displayName = item.name || item.title || item.filename || 'Untitled';
          const isDraggedOver = dragOverFolder === item.uid;
          
          return (
            <div 
              key={item.uid}
              onClick={() => handleItemClick(item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              className={`p-5 rounded-xl border bg-white flex flex-col items-center gap-3 cursor-pointer transition-all ${
                isDraggedOver && isFolder
                  ? 'border-blue-500 border-2 bg-blue-50 shadow-xl scale-105' 
                  : 'border-[#dde3ed] hover:shadow-lg'
              }`}
            >
              <div className={`w-12 h-12 ${getItemIconBg(item)} rounded-lg flex items-center justify-center`}>
                {isFolder ? (
                  <Folder className="w-6 h-6 text-amber-600" />
                ) : (
                  getFileIcon(item)
                )}
              </div>
              <h1 className="text-sm font-semibold text-gray-800 text-center truncate w-full" title={displayName}>
                {displayName}
              </h1>
              {isFolder && isDraggedOver && (
                <span className="text-xs text-blue-600 font-medium">Drop files here</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssetUploadExtension;

