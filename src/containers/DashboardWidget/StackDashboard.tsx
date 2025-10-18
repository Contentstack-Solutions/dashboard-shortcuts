import { useEffect } from "react";
import "./StackDashboard.css";
import { useAppSdk } from "../../common/hooks/useAppSdk";
import { FileText, FileCode, User, FileEdit, PanelsTopLeft } from "lucide-react";

const StackDashboardExtension = () => {
  const appSdk = useAppSdk();
  
  useEffect(() => {
    const initFrame = async () => {
      if (appSdk?.location?.DashboardWidget?.frame) {
        appSdk.location.DashboardWidget.frame.disableAutoResizing();
        await appSdk.location.DashboardWidget.frame.updateHeight(220);
      }
    };
    
    initFrame();
  }, [appSdk]);

  const handleNavigate = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <div style={{ overflow: 'hidden' }}>
      <div className="grid grid-cols-5 gap-4 p-5">
        <div 
          onClick={() => handleNavigate('https://app.contentstack.com/#!/stack/bltd0e1f9b011db0410/content-type/article/en-us/entry/create?branch=main')}
          className="p-5 rounded-xl border border-[#dde3ed] bg-white flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-sm font-semibold text-gray-800">Article</h1>
        </div>
        
        <div 
          onClick={() => handleNavigate('https://app.contentstack.com/#!/stack/bltd0e1f9b011db0410/content-type/articlejss/en-us/entry/create?branch=main')}
          className="p-5 rounded-xl border border-[#dde3ed] bg-white flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileCode className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-sm font-semibold text-gray-800">ArticleJSS</h1>
        </div>
        
        <div 
          onClick={() => handleNavigate('https://app.contentstack.com/#!/stack/bltd0e1f9b011db0410/content-type/author/en-us/entry/create?branch=main')}
          className="p-5 rounded-xl border border-[#dde3ed] bg-white flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-sm font-semibold text-gray-800">Author</h1>
        </div>
        
        <div 
          onClick={() => handleNavigate('https://app.contentstack.com/#!/stack/bltd0e1f9b011db0410/content-type/blog_post/en-us/entry/create?branch=main')}
          className="p-5 rounded-xl border border-[#dde3ed] bg-white flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <FileEdit className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-sm font-semibold text-gray-800">Blog Post</h1>
        </div>
        
        <div 
          onClick={() => handleNavigate('https://app.contentstack.com/#!/stack/bltd0e1f9b011db0410/content-type/page/en-us/entry/create?branch=main')}
          className="p-5 rounded-xl border border-[#dde3ed] bg-white flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <PanelsTopLeft className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-sm font-semibold text-gray-800">UB</h1>
        </div>
      </div>
    </div>
  );
};

export default StackDashboardExtension;
