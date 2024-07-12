import { ipcMain } from "electron";
import { get, post } from "../libs/requests";
import { AxiosError } from "axios";

export function requestHandler() {
  ipcMain.handle('vame:get', async (_, url: string) => {
    try {
      const response = await get(url);
      return { success: true, data: response };
    } catch (e) {
      let errorMessage = "Error on main process";
      if (e instanceof AxiosError) {
        errorMessage = e.message;
      }
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('vame:post', async (_, url: string, data: Record<string, unknown>) => {
    try {
      const response = await post(url, data);
      return { success: true, data: response };
    } catch (e) {
      let errorMessage = "Error on main process";
      if (e instanceof AxiosError) {
        errorMessage = e.message;
      }
      return { success: false, error: errorMessage };
    }
  });

  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       "Content-Security-Policy": ["*"],
  //     },
  //   });
  // });
}
