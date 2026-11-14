import { ArrowRight, Armchair, Check, MapPin, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Alert from "../components/Alert";
import BookingDialog from "../components/BookingDialog";
import Brand from "../components/Brand";
import BusCard from "../components/BusCard";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";

function Hero() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-8 sm:px-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:pb-20 md:pt-14 lg:px-12">
      <div className="max-w-xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-leaf/20 bg-leaf/5 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.13em] text-forest">
          <span className="h-2 w-2 rounded-full bg-leaf" />
          Your next trip, made simple
        </div>
        <h1 className="font-display text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
          Make the miles
          <br />
          feel <span className="text-forest">shorter.</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-slate-600 sm:text-lg">
          Find your ride, pick your seat, and leave the little details to us.
          Your journey starts right here.
        </p>
        <a
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-forest/15 transition hover:-translate-y-0.5 hover:bg-forest-dark"
          href="#buses"
        >
          Find your seat <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </a>
        <div className="mt-10 flex items-center gap-2 text-sm text-slate-500">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-leaf" />
          <span>
            <strong className="font-semibold text-ink">Easy booking.</strong>{" "}
            No fuss, just go.
          </span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <div className="absolute -left-5 top-8 h-24 w-24 rounded-full bg-[#dbe8d5] blur-2xl" />
        <div className="absolute -right-4 bottom-8 h-28 w-28 rounded-full bg-[#f2dfbd] blur-2xl" />
        <div className="relative overflow-hidden rounded-[2rem] bg-forest p-5 text-white shadow-2xl shadow-forest/15 sm:p-7">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -right-7 -top-11 h-44 w-44 rounded-full border border-white/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                The good part
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Getting there.
              </h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <MapPin aria-hidden="true" className="h-5 w-5" />
            </span>
          </div>
          <div className="relative mt-8 rounded-2xl bg-[#f7f6ef] p-5 text-ink sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Your travel companion
                </p>
                <p className="mt-1 font-display text-xl font-semibold">
                  A seat with your name on it.
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6eddf] text-forest">
                <Armchair aria-hidden="true" className="h-5 w-5" />
              </span>
            </div>
            <div className="my-5 border-t border-dashed border-stone-300" />
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6eddf] text-forest">
                <Check aria-hidden="true" className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">Your ride, your way</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Browse available buses below
                </p>
              </div>
              <span className="text-xs font-semibold text-forest">Let&apos;s go</span>
            </div>
          </div>
          <p className="relative mt-5 text-center text-xs text-white/65">
            Thoughtful travel starts with one small step.
          </p>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["01", "Find your bus", "See which buses have seats ready for you."],
    ["02", "Make it yours", "Sign in, choose a seat, and reserve it."],
    ["03", "You’re all set", "Your reservation is confirmed in a moment."],
  ];

  return (
    <section
      className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12"
      id="how-it-works"
    >
      <div className="grid gap-8 sm:grid-cols-3 sm:gap-10">
        {steps.map(([number, title, description]) => (
          <div className="flex gap-4" key={number}>
            <span className="font-display text-sm font-semibold text-leaf">{number}</span>
            <div>
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBuses() {
    setError("");
    setLoading(true);
    try {
      const [busData, bookingData] = await Promise.all([
        api.buses.list(),
        api.bookings.occupied(),
      ]);
      setBuses(busData);
      setBookings(bookingData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBuses();
  }, []);

  useEffect(() => {
    const bus = buses.find(
      (item) => Number(item.id) === Number(location.state?.openBusId),
    );
    if (bus) {
      setSelectedBus(bus);
      navigate("/", { replace: true, state: null });
    }
  }, [buses, location.state, navigate]);

  const filteredBuses = useMemo(
    () =>
      buses.filter((bus) =>
        String(bus.busNumber).toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [buses, search],
  );
  const availableCount = buses.reduce(
    (sum, bus) => sum + Number(bus.availableSeats || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main>
        <Hero />
        <section
          className="scroll-mt-8 border-y border-stone-200/70 bg-[#f1f2eb] py-14 sm:py-16"
          id="buses"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-forest">
                  Find your ride
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  Pick a bus. Pick a seat.
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Browse the buses and seats available right now.
                </p>
              </div>
              <label className="relative block w-full sm:max-w-xs">
                <span className="sr-only">Search by bus number</span>
                <input
                  className="form-input rounded-full border-white bg-white"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search bus number"
                  type="search"
                  value={search}
                />
              </label>
            </div>

            {error && <div className="mt-7"><Alert onRetry={loadBuses}>{error}</Alert></div>}

            {loading ? (
              <LoadingScreen label="Finding available buses…" />
            ) : !error && filteredBuses.length > 0 ? (
              <>
                <div className="mb-4 mt-8 flex items-center justify-between text-sm text-slate-500">
                  <span>
                    {filteredBuses.length} {filteredBuses.length === 1 ? "bus" : "buses"} to choose from
                  </span>
                  <span>{availableCount} seats available in total</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredBuses.map((bus) => (
                    <BusCard bus={bus} key={bus.id} onSelect={setSelectedBus} />
                  ))}
                </div>
              </>
            ) : (
              !error && (
                <div className="mt-8">
                  <EmptyState
                    title={search ? "No buses match that number" : "No buses available yet"}
                  >
                    {search
                      ? "Try another bus number, or clear your search to see all available buses."
                      : "An administrator needs to add a bus before passengers can reserve seats."}
                  </EmptyState>
                  {search ? (
                    <div className="mt-4 text-center">
                      <button
                        className="text-sm font-semibold text-forest hover:underline"
                        onClick={() => setSearch("")}
                        type="button"
                      >
                        Clear search
                      </button>
                    </div>
                  ) : user?.role === "ADMIN" ? (
                    <div className="mt-4 text-center">
                      <Link
                        className="inline-flex rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark"
                        to="/admin/buses"
                      >
                        Add a bus
                      </Link>
                    </div>
                  ) : user ? (
                    <p className="mt-4 text-center text-sm text-slate-500">
                      Please contact your administrator to add buses.
                    </p>
                  ) : (
                    <p className="mt-4 text-center text-sm text-slate-500">
                      <Link
                        className="font-semibold text-forest hover:underline"
                        to="/login?role=admin"
                      >
                        Admin? Sign in to add a bus.
                      </Link>
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </section>
        <HowItWorks />
      </main>
      <footer className="border-t border-stone-200/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Brand />
          <span>Here&apos;s to the journeys that stay with you.</span>
        </div>
      </footer>
      {selectedBus && (
        <BookingDialog
          bus={selectedBus}
          bookings={bookings}
          onClose={() => setSelectedBus(null)}
          user={user}
        />
      )}
    </div>
  );
}
