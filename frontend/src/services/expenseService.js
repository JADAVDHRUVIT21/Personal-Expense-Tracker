
import api from "./api";

export const getExpenses = async () => {
  const response = await api.get("/expenses");
  return response.data;
};
