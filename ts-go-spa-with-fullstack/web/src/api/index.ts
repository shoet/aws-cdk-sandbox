import { API_BASE_URL } from "../constant";

export const getAPIURL = (path: string) => {
  return `${API_BASE_URL}${path}`;
};

export const handleSuccess = (res: Response) => {
  return res.json();
};

export const handleFailure = (error: unknown) => {
  if (error instanceof Error) {
    console.error("Error:", error);
    throw error;
  } else {
    console.error("Error:", error);
    throw new Error("Unknown error");
  }
};
