import { ipcMain } from "electron";
import { get, post } from "../libs/requests";
import { AxiosError } from "axios";

export function vameStatesHandler() {
  const states = {
    connected: false,
    ready: false
  };

  ipcMain.handle("vame:connected", async (): Promise<{ success: boolean; data?: boolean; error?: string }> => {
    if (states.connected) {
      return { success: true, data: true };
    }

    try {
      await get("connected");
      console.log(`[electron]: Python connected!`);
      states.connected = true;
      return { success: true, data: states.connected };
    } catch (e) {
      let errorMessage = "Error on main process";
      if (e instanceof AxiosError) {
        errorMessage = e.message;
      }
      states.connected = false;
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle("vame:ready", async (): Promise<{ success: boolean; data?: boolean; error?: string }> => {
    if (states.ready) {
      return { success: true, data: true };
    }

    try {
      await get("ready");
      console.log(`[electron]: VAME is ready!`);
      states.ready = true;
      return { success: true, data: states.ready };
    } catch (e) {
      let errorMessage = "Error on main process";
      if (e instanceof AxiosError) {
        errorMessage = e.message;
      }
      states.ready = false;
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle("vame:project:ready", async (_, data: any): Promise<{ success: boolean; data?: boolean; error?: string }> => {

    return await new Promise((resolve) => {
      let isReady: boolean | null = null;
      let error: string | null = null

      const id = setInterval(() => {
        post(`project_ready`, { project: data })
          .then((res: any) => {
            if (res) {
              isReady = res.is_ready
            }
          })
          .catch((e) => {
            error = String(e)
          });
        if (typeof isReady === "boolean") {
          clearInterval(id)
          return resolve({ success: true, data: isReady })
        } else if (typeof error === "string") {
          clearInterval(id)
          return resolve({ success: false, error: error })
        }
      }, 1000)
    })
  });
}
