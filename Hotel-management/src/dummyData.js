// dummyData.js
export const dummyData = {
    customers: [
      { customerID: 'C1001', name: 'John Doe', contactInfo: '12345678901', nationality: 'American', gender: 'Male', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { customerID: 'C1002', name: 'Jane Smith', contactInfo: '98765432109', nationality: 'British', gender: 'Female', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    ],
    rooms: [
      { roomNo: 'RM101', hotelID: 'HT001', roomCategory: 'deluxe', rent: 200, status: 'Occupied', lastOccupied: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    ],
    invoices: [
      { invoiceID: 'INV1001', customerID: 'C1001', amount: 500, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: 'Paid' },
      { invoiceID: 'INV1002', customerID: 'C1002', amount: 503, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: 'Paid' }
    ],
    reservations: [
      { reservationID: 'RE1001', customerID: 'C1001', roomNo: 'RM101', hotelID: 'HT001', checkIn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), checkOut: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) },
      { reservationID: 'RE1002', customerID: 'C1002', roomNo: 'RM102', hotelID: 'HT001', checkIn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), checkOut: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }
    ]
  };