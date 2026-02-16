export const logger = {
  info(message: string) {
    console.log(message);
  },
  error(message: string, err?: unknown) {
    console.error(message, err);
  },
};
