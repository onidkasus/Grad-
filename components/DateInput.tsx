import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import hr from 'date-fns/locale/hr';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('hr', hr);

export default function DateInput({ value, onChange, minDate, maxDate, placeholder, className }) {
  return (
    <DatePicker
      selected={value ? new Date(value) : null}
      onChange={date => onChange(date)}
      dateFormat="dd/MM/yyyy"
      locale="hr"
      minDate={minDate}
      maxDate={maxDate}
      placeholderText={placeholder || 'Odaberi datum'}
      className={className}
      showPopperArrow={false}
      calendarStartDay={1}
      isClearable
      todayButton="Danas"
    />
  );
}
