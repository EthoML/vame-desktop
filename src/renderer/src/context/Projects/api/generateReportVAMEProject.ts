import { post } from "@renderer/utils/requests";

type GenerateReportVAMEProjectProps = {
    project: string;
    [key: string]: any;
};

export const generateReportVAMEProject = async (data: GenerateReportVAMEProjectProps) => {
    const result = await post<{ status: string }>("report", { ...data });

    if (result.success) {
        return result.data;
    } else {
        throw new Error(result.error);
    }
};
