import React, { useEffect, useState } from 'react'
import DTPicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export default function DateTimePicker({ id, value, onChange, placeholder, dateFormat, showTime = false, timeFormat, disabled = false }) {
  const [val, setVal] = useState(new Date());
  const [disbled, setDisbled] = useState(disabled);

  useEffect(() => {
    setVal(value);
    setDisbled(disabled);
  }, [value, disabled]);

  const changeValue = (value) => {
    setVal(value);
    onChange(value);
  }
  return (
    <DTPicker
      id={id}
      selected={val}
      onChange={changeValue}
      placeholderText={placeholder}
      dateFormat={dateFormat ?? 'dd-MMM-yyyy HH:mm'}
      showTimeSelect={showTime}
      timeIntervals={5}
      timeFormat={timeFormat ?? 'HH:mm'}
      className={`block w-full border disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 rounded-lg p-2.5 text-sm`}
      disabled={disbled}
    />
  )
}
