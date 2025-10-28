import { useEffect, useState } from "react";
import "./StackDashboard.css";
import { useAppSdk } from "../../common/hooks/useAppSdk";
import { FileText } from "lucide-react"; // You can swap icons later dynamically

type ContentType = {
  uid: string;
  title: string;
};

const StackDashboardExtension = () => {
  const appSdk = useAppSdk();
  const [apiKey, setApiKey] = useState<string>();
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const frame = appSdk?.location?.DashboardWidget?.frame;
        if (frame) {
          frame.disableAutoResizing();
          await frame.updateHeight(400);
        }

        // Get stack data
        const stackData = appSdk?.stack?.getData?.();
        setApiKey(stackData?.api_key);

        // Fetch content types
        const res: any = await appSdk?.stack?.getContentTypes?.();
        const types: ContentType[] = res?.content_types || [];
        setContentTypes(types.sort((a, b) => a.title.localeCompare(b.title)));
      } catch (err) {
        console.error("Error initializing dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [appSdk]);

  const handleNavigate = (uid: string) => {
    if (!apiKey) return;
    const url = `https://app.contentstack.com/#!/stack/${apiKey}/content-type/${uid}/en-us/entry/create?branch=main`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="p-5 text-sm text-gray-600 flex items-center justify-center">
        Loading content types...
      </div>
    );
  }

  if (!apiKey || contentTypes.length === 0) {
    return (
      <div className="p-5 text-sm text-gray-600 flex items-center justify-center">
        No content types found.
      </div>
    );
  }

  return (
    <div style={{ overflow: "hidden" }}>
      <div className="grid grid-cols-5 gap-4 p-5">
        {contentTypes.map((ct) => (
          <div
            key={ct.uid}
            onClick={() => handleNavigate(ct.uid)}
            className="p-5 rounded-xl border border-[#dde3ed] bg-white flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-sm font-semibold text-gray-800 text-center">
              {ct.title}
            </h1>
            <p className="text-xs text-gray-500">{ct.uid}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StackDashboardExtension;
