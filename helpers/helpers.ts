export const scrollToBottom = (element: React.MutableRefObject<any>) => {
  if (element.current) {
    element.current.scrollTop = element.current.scrollHeight;
  }
};
