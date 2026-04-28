import { useState, useEffect } from 'react';

// Hook này sẽ giữ lại value. Nó chỉ thực sự cập nhật giá trị mới khi người dùng NGỪNG GÕ sau X mili-giây
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Xóa timeout cũ nếu người dùng tiếp tục gõ (chưa hết thời gian delay)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}