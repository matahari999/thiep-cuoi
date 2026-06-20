export const photoSettings = [
  { id: 'gallery-1.jpg', animation: 'fade-up', delay: 0.2, text: 'Thanh Phong & Minh Phuong' },
  { id: 'gallery-2.jpg', animation: 'slide-right', delay: 0.3, text: '08.05.2022' },
  { id: 'gallery-3.jpg', animation: 'zoom-in', delay: 0.1, text: 'Love Story' },
  { id: 'gallery-4.jpg', animation: 'fade-left', delay: 0.4, text: 'Our Big Day' },
  { id: 'gallery-5.jpg', animation: 'rotate-in', delay: 0.2, text: 'Happily Ever After' },
  { id: 'gallery-6.jpg', animation: 'fade-up', delay: 0.3, text: 'Forever Begins' },
  { id: 'gallery-7.jpg', animation: 'slide-left', delay: 0.2, text: 'Save the Date' },
  { id: 'gallery-8.jpg', animation: 'zoom-out', delay: 0.5, text: 'Together' },
  { id: 'gallery-9.jpg', animation: 'fade-up', delay: 0.1, text: 'True Love' },
  { id: 'gallery-10.jpg', animation: 'slide-right', delay: 0.4, text: 'Sweetest Moment' },
  { id: 'gallery-11.jpg', animation: 'zoom-in', delay: 0.2, text: 'Beautiful Day' },
  { id: 'gallery-12.jpg', animation: 'fade-left', delay: 0.3, text: 'With You' },
  { id: 'gallery-13.jpg', animation: 'rotate-in', delay: 0.1, text: 'Magic Moments' },
  { id: 'gallery-14.jpg', animation: 'fade-up', delay: 0.4, text: 'Love & Joy' },
  { id: 'gallery-15.jpg', animation: 'slide-left', delay: 0.2, text: 'Our Journey' },
  { id: 'gallery-16.jpg', animation: 'zoom-out', delay: 0.3, text: 'Wedding Day' },
  { id: 'gallery-17.jpg', animation: 'fade-up', delay: 0.2, text: 'Pure Love' },
  { id: 'gallery-18.jpg', animation: 'slide-right', delay: 0.5, text: 'Golden Days' },
  { id: 'gallery-19.jpg', animation: 'zoom-in', delay: 0.1, text: 'My Heart' },
  { id: 'gallery-20.jpg', animation: 'fade-left', delay: 0.3, text: 'Simple Love' },
];

export const getAnimation = (type: string) => {
  switch (type) {
    case 'fade-up': return { initial: { opacity: 0, y: 50 }, whileInView: { opacity: 1, y: 0 } };
    case 'slide-right': return { initial: { opacity: 0, x: -50 }, whileInView: { opacity: 1, x: 0 } };
    case 'slide-left': return { initial: { opacity: 0, x: 50 }, whileInView: { opacity: 1, x: 0 } };
    case 'zoom-in': return { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 } };
    case 'zoom-out': return { initial: { opacity: 0, scale: 1.2 }, whileInView: { opacity: 1, scale: 1 } };
    case 'rotate-in': return { initial: { opacity: 0, rotate: -10 }, whileInView: { opacity: 1, rotate: 0 } };
    default: return { initial: { opacity: 0 }, whileInView: { opacity: 1 } };
  }
};
