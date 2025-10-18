import React, { useRef } from "react";
import Icon from "../../assets/GearSix.svg";
import localeTexts from "../../common/locales/en-us/index";
import parse from "html-react-parser";
import styles from "./AppConfiguration.module.css";
import { useInstallationData } from "../../common/hooks/useInstallationData";
import Tooltip from "../Tooltip/Tooltip";

const AppConfigurationExtension: React.FC = () => {
  const { installationData, setInstallationData } = useInstallationData();
  const appConfigDataRef = useRef<HTMLInputElement>(null);
  const serverConfigDataRef = useRef<HTMLInputElement>(null);
  const assetFoldersRef = useRef<HTMLTextAreaElement>(null);

  const updateConfig = async () => {
    if (typeof setInstallationData !== "undefined") {
      let assetFolders;
      try {
        assetFolders = assetFoldersRef.current?.value 
          ? JSON.parse(assetFoldersRef.current.value)
          : undefined;
      } catch (e) {
        // If JSON is invalid, keep the previous value
        assetFolders = installationData.configuration.asset_folders;
      }

      setInstallationData({
        configuration: { 
          sample_app_configuration: appConfigDataRef.current?.value,
          asset_folders: assetFolders
        },
        serverConfiguration: { sampl_server_configuration: serverConfigDataRef.current?.value },
      });
    }
  };

  return (
    <div className={`${styles.layoutContainer}`}>
      <div className={`${styles.appConfig}`}>
        <div className={`${styles.appConfigLogoContainer}`}>
          <img src={Icon} alt="icon" />
          <p>{localeTexts.ConfigScreen.title}</p>
        </div>

        <div className={`${styles.configWrapper}`}>
          <div className={`${styles.configContainer}`}>
            <div className={`${styles.infoContainerWrapper}`}>
              <div className={`${styles.infoContainer}`}>
                <div className={`${styles.labelWrapper}`}>
                  <label htmlFor="appConfigData">Sample App Configuration</label>
                  <Tooltip content="You can save this field for information such as Username, Email, Number, Date, etc." />
                </div>
              </div>
              <div className={`${styles.inputContainer}`}>
                <input
                  type="text"
                  ref={appConfigDataRef}
                  required
                  value={installationData.configuration.sample_app_configuration as string}
                  placeholder="Enter Field Value"
                  name="appConfigData"
                  autoComplete="off"
                  className={`${styles.fieldInput}`}
                  onChange={updateConfig} />
              </div>
            </div>
            <div className={`${styles.descriptionContainer}`}>
              <p>Use this field to share non-sensitive configurations of your app with other locations.</p>
            </div>
          </div>

          <div className={`${styles.configContainer}`}>
            <div className={`${styles.infoContainerWrapper}`}>
              <div className={`${styles.infoContainer}`}>
                <div className={`${styles.labelWrapper}`}>
                  <label htmlFor="serverConfigData">Sample Server Configuration Field </label>
                  <Tooltip content="You can use this field for information such as Passwords, API Key, Client Secret, Client ID, etc." />
                </div>
              </div>
              <div className={`${styles.inputContainer}`}>
                <input
                  type="text"
                  ref={serverConfigDataRef}
                  required
                  value={installationData.serverConfiguration.sample_app_configuration as string}
                  placeholder="Enter Field Value"
                  name="serverConfigData"
                  autoComplete="off"
                  onChange={updateConfig} />
              </div>
            </div>
            <div className={`${styles.descriptionContainer}`}>
              <p>
                Use this field to store sensitive configurations of your app. It is directly shared with the backend via
                webhooks.
              </p>
            </div>
          </div>

          <div className={`${styles.configContainer}`}>
            <div className={`${styles.infoContainerWrapper}`}>
              <div className={`${styles.infoContainer}`}>
                <div className={`${styles.labelWrapper}`}>
                  <label htmlFor="assetFolders">Asset Folders Configuration</label>
                  <Tooltip content="Configure asset folder shortcuts for the Asset Upload widget. Enter a JSON array of folders." />
                </div>
              </div>
              <div className={`${styles.inputContainer}`}>
                <textarea
                  ref={assetFoldersRef}
                  defaultValue={JSON.stringify(installationData.configuration.asset_folders || [
                    { name: "Images", folderUid: "" },
                    { name: "Videos", folderUid: "" },
                    { name: "Documents", folderUid: "" }
                  ], null, 2)}
                  placeholder='[{"name": "Images", "folderUid": "blt123"}]'
                  name="assetFolders"
                  rows={8}
                  style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  className={`${styles.fieldInput}`}
                  onChange={updateConfig}
                />
              </div>
            </div>
            <div className={`${styles.descriptionContainer}`}>
              <p>
                Configure folder shortcuts for the Asset Upload dashboard widget. Format: <code>[{`{"name": "Folder Name", "folderUid": "blt123abc"}`}]</code>
                <br />You can find folder UIDs in your asset manager URL.
              </p>
            </div>
          </div>
        </div>

        <div className={`${styles.locationDescription}`}>
          <p className={`${styles.locationDescriptionText}`}>{parse(localeTexts.ConfigScreen.body)}</p>
          <a target="_blank" rel="noreferrer" href={localeTexts.ConfigScreen.button.url}>
            <span className={`${styles.locationDescriptionLink}`}>{localeTexts.ConfigScreen.button.text}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppConfigurationExtension;
