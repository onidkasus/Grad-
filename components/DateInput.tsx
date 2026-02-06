import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { hr } from 'date-fns/locale/hr';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker.css';

registerLocale('hr', hr);

export default function DateInput({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder,
  className,
  dateFormat = 'dd/MM/yyyy',
  ...rest
}) {
  return (
    <div className="date-input-wrapper">
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={date => onChange(date)}
        dateFormat={dateFormat}
        locale="hr"
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder || 'dd/mm/yyyy'}
        className={`date-input-field ${className || ''}`}
        showPopperArrow={false}
        calendarStartDay={1}
        isClearable
        todayButton="Danas"
        calendarClassName="custom-calendar"
        {...rest}
      />
    </div>
  );
}
