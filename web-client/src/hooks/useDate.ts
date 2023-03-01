const useDate = () => {
  return {
    getServerDateFromClientDate: (isoDate: string) => {
      const date = new Date(isoDate);
      // Reverting timezone operations made by Date constructor.
      date.setMinutes(date.getTimezoneOffset());
      return date.toISOString();
    },
    getClientDateFromServerDate: (isoDate: string) => {
      const date = new Date(isoDate);
      // Reverting timezone operations made by Date constructor.
      date.setMinutes(-date.getTimezoneOffset());
      return date.toISOString();
    },
  };
};

export default useDate;
