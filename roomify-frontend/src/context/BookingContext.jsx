import React, { createContext, useContext, useReducer } from 'react';

const initialState = {
  selectedRoom: null,
  bookingDetails: {
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
  },
  searchFilters: {
    priceRange: [0, 2000000],
    roomType: 'all',
    facilities: [],
  },
};

const bookingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_ROOM':
      return { ...state, selectedRoom: action.payload };
    case 'SET_BOOKING_DETAILS':
      return {
        ...state,
        bookingDetails: { ...state.bookingDetails, ...action.payload },
      };
    case 'SET_SEARCH_FILTERS':
      return {
        ...state,
        searchFilters: { ...state.searchFilters, ...action.payload },
      };
    case 'CLEAR_BOOKING':
      return initialState;
    default:
      return state;
  }
};

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  return (
    <BookingContext.Provider value={{ state, dispatch }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
