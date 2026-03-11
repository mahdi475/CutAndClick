import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Product, Service } from '../types';
import { useAuth } from '../context/AuthContext';

interface BookingPageProps {
    item: Product | Service;
    onBack: () => void;
    onConfirm: (details: { date: string; time: string }) => void;
}

const MONTHS_SV = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];
const DAY_HEADERS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

function toISODate(year: number, month: number, day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isBeforeToday(year: number, month: number, day: number) {
    const d = new Date(year, month, day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d < today;
}

const BookingPage: React.FC<BookingPageProps> = ({ item, onBack, onConfirm }) => {
    const { user } = useAuth();
    const today = new Date();

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const [slots, setSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slotsClosed, setSlotsClosed] = useState(false);
    const [slotsError, setSlotsError] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState('');

    // haircutId is on the item if it's a Service (has description)
    // We need it to fetch available slots
    const haircutId = item.id;

    // ── Build calendar grid ────────────────────────────────────
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    // JS getDay(): 0=Sun, 1=Mon ... We want Mon=0
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const calCells: { day: number; month: 'prev' | 'curr' | 'next'; disabled: boolean }[] = [];

    for (let i = 0; i < startOffset; i++) {
        calCells.push({ day: daysInPrevMonth - startOffset + 1 + i, month: 'prev', disabled: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        calCells.push({ day: d, month: 'curr', disabled: isBeforeToday(viewYear, viewMonth, d) });
    }
    const remaining = calCells.length % 7 === 0 ? 0 : 7 - (calCells.length % 7);
    for (let i = 1; i <= remaining; i++) {
        calCells.push({ day: i, month: 'next', disabled: true });
    }

    // ── Fetch slots when date changes ──────────────────────────
    useEffect(() => {
        if (!selectedDate) return;
        setSlotsLoading(true);
        setSlotsError('');
        setSelectedTime(null);
        fetch(`/api/bookings/available/${haircutId}?date=${selectedDate}`)
            .then(r => r.json())
            .then(data => {
                setSlots(data.available || []);
                setSlotsClosed(data.closed === true);
                setSlotsLoading(false);
            })
            .catch(() => {
                setSlotsError('Kunde inte hämta tider');
                setSlotsLoading(false);
            });
    }, [selectedDate, haircutId]);

    // ── Select a day ───────────────────────────────────────────
    const handleDayClick = (cell: typeof calCells[0]) => {
        if (cell.month !== 'curr' || cell.disabled) return;
        setSelectedDay(cell.day);
        setSelectedDate(toISODate(viewYear, viewMonth, cell.day));
    };

    // ── Navigate months ────────────────────────────────────────
    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
        setSelectedDay(null); setSelectedDate(null); setSlots([]);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
        setSelectedDay(null); setSelectedDate(null); setSlots([]);
    };
    // Disable prev if already at current month
    const isPrevDisabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();

    // ── Submit booking ─────────────────────────────────────────
    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) return;
        setSubmitting(true);
        setBookingError('');
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
                },
                body: JSON.stringify({
                    haircut_id: haircutId,
                    booking_date: selectedDate,
                    booking_time: selectedTime,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setBookingError(
                    res.status === 409
                        ? 'Tyvärr tog någon annan den just nu — välj en annan tid'
                        : data.error || 'Något gick fel, försök igen'
                );
                setSubmitting(false);
                return;
            }
            onConfirm({ date: selectedDate, time: selectedTime });
        } catch {
            setBookingError('Kunde inte nå servern. Försök igen.');
            setSubmitting(false);
        }
    };

    const isService = 'description' in item;
    const duration = (item as Service).duration_minutes;

    return (
        <div className="flex flex-col min-h-full bg-white pb-36 pt-8 relative">

            {/* Back */}
            <div className="px-5 mb-4">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={20} className="text-[#333333]" />
                </button>
            </div>

            {/* Title */}
            <div className="px-6 mb-6">
                <h1 className="font-inter font-bold text-[22px] text-black">{item.title}</h1>
                {duration && <p className="text-black/40 font-inter text-[14px] mt-0.5">{duration} min</p>}
            </div>

            {/* Calendar */}
            <div className="px-5">
                <div className="w-full bg-white rounded-[20px] shadow-[0px_12px_24px_rgba(0,0,0,0.07)] border border-[#E5E5EF] p-4 pb-6">

                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-6 px-2">
                        <button
                            onClick={prevMonth}
                            disabled={isPrevDisabled}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isPrevDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                        >
                            <ChevronLeft size={20} className="text-[#9291A5]" />
                        </button>
                        <span className="text-[#615E83] font-inter font-bold text-[18px]">
                            {MONTHS_SV[viewMonth]} {viewYear}
                        </span>
                        <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                            <ChevronRight size={20} className="text-[#9291A5]" />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-3">
                        {DAY_HEADERS.map(d => (
                            <div key={d} className="text-center text-[#9291A5] font-inter font-medium text-[14px]">{d}</div>
                        ))}
                    </div>

                    <div className="h-px bg-[#F2F1FF] w-full mb-4" />

                    {/* Date grid */}
                    <div className="grid grid-cols-7 gap-y-3 justify-items-center">
                        {calCells.map((cell, idx) => {
                            const isSelected = cell.month === 'curr' && cell.day === selectedDay;
                            const isToday = cell.month === 'curr'
                                && cell.day === today.getDate()
                                && viewMonth === today.getMonth()
                                && viewYear === today.getFullYear();
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDayClick(cell)}
                                    disabled={cell.month !== 'curr' || cell.disabled}
                                    className={`relative w-9 h-9 flex items-center justify-center rounded-full transition-all
                    ${isSelected ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-105' : ''}
                    ${!isSelected && isToday ? 'border-2 border-black/20' : ''}
                    ${cell.month !== 'curr' || cell.disabled ? 'opacity-25 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                  `}
                                >
                                    <span className={`text-[15px] font-inter font-medium ${isSelected ? 'text-white' : 'text-[#1D1C2B]'}`}>
                                        {cell.day}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Time Slots */}
            <div className="px-5 mt-8">
                <h2 className="font-inter font-semibold text-[16px] text-black mb-4">Välj tid</h2>
                {!selectedDate ? (
                    <p className="text-black/40 font-inter text-[14px]">Välj ett datum ovan för att se lediga tider</p>
                ) : slotsLoading ? (
                    <div className="flex items-center gap-2 text-black/40">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="font-inter text-[14px]">Hämtar tider...</span>
                    </div>
                ) : slotsClosed ? (
                    <p className="text-red-400 font-inter text-[14px]">Stängt den dagen — välj ett annat datum</p>
                ) : slotsError ? (
                    <p className="text-red-400 font-inter text-[14px]">{slotsError}</p>
                ) : slots.length === 0 ? (
                    <p className="text-black/40 font-inter text-[14px]">Inga lediga tider — välj ett annat datum</p>
                ) : (
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {slots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`w-[110px] h-[72px] rounded-[17px] border flex items-center justify-center flex-shrink-0 transition-all
                  ${selectedTime === time
                                        ? 'bg-black border-black text-white shadow-lg scale-105'
                                        : 'bg-white border-gray-200 text-black shadow-sm hover:border-black'
                                    }`}
                            >
                                <span className="font-inter font-bold text-[18px]">{time}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="px-6 mt-10">
                <div className="flex justify-between items-baseline border-t border-gray-100 pt-4">
                    <span className="text-black font-inter font-bold text-[22px]">Totalt</span>
                    <span className="text-black font-inter font-medium text-[22px]">{item.price} kr</span>
                </div>
                {selectedDate && selectedTime && (
                    <p className="text-black/40 font-inter text-[13px] mt-2">
                        {selectedDate} kl {selectedTime}
                    </p>
                )}
            </div>

            {/* Error */}
            {bookingError && (
                <div className="px-6 mt-4">
                    <p className="text-red-500 font-inter text-[14px] bg-red-50 rounded-xl px-4 py-3">{bookingError}</p>
                </div>
            )}

            {/* Disclaimer */}
            <div className="px-10 mt-6">
                <p className="text-black/40 font-inter text-[10px] text-center leading-tight">
                    Genom att boka bekräftar du att du godkänner salongens avbokningspolicy.
                </p>
            </div>

            {/* Bottom CTA */}
            <div className="absolute bottom-6 left-0 w-full px-6 z-50">
                <button
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedTime || submitting}
                    className={`w-full h-[72px] rounded-[20px] flex items-center justify-between px-3 pl-5 pr-6 shadow-xl transition-all
            ${selectedDate && selectedTime && !submitting
                            ? 'bg-black text-white active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <div className="w-[48px] h-[48px] bg-white/20 rounded-[14px] flex items-center justify-center">
                        {submitting
                            ? <Loader2 size={22} className="text-white animate-spin" />
                            : <ArrowRight size={22} className="text-white" strokeWidth={2.5} />
                        }
                    </div>
                    <span className="font-poppins font-semibold text-[18px]">
                        {submitting ? 'Bokar...' : 'Slutför bokning'}
                    </span>
                    <span className="font-poppins font-semibold text-[18px]">{item.price} kr</span>
                </button>
            </div>
        </div>
    );
};

export default BookingPage;