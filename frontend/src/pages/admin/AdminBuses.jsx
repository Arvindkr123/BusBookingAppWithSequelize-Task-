import { BusFront, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import EmptyState from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import PageHeading from "../../components/admin/PageHeading";

export default function AdminBuses() {
  const [buses, setBuses] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [busNumber, setBusNumber] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadBuses() {
    setError("");
    setLoading(true);
    try {
      setBuses(await api.buses.list());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBuses();
  }, []);

  function openCreateForm() {
    setEditingBus(null);
    setBusNumber("");
    setTotalSeats("");
    setError("");
    setFormOpen(true);
  }

  function openEditForm(bus) {
    setEditingBus(bus);
    setBusNumber(bus.busNumber);
    setTotalSeats("");
    setError("");
    setFormOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (editingBus) {
        await api.buses.update(editingBus.id, { busNumber: busNumber.trim() });
        setNotice("Bus details updated.");
      } else {
        const capacity = Number(totalSeats);
        await api.buses.create({
          busNumber: busNumber.trim(),
          totalSeats: capacity,
          availableSeats: capacity,
        });
        setNotice("Bus added to the fleet.");
      }
      setFormOpen(false);
      await loadBuses();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(bus) {
    if (!window.confirm(`Remove bus ${bus.busNumber}?`)) return;
    setError("");
    setNotice("");
    try {
      await api.buses.remove(bus.id);
      setNotice(`Bus ${bus.busNumber} removed.`);
      await loadBuses();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="space-y-7">
      <PageHeading
        action={
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-dark"
            onClick={openCreateForm}
            type="button"
          >
            <Plus aria-hidden="true" className="h-4 w-4" /> Add bus
          </button>
        }
        description="Add buses and keep fleet records up to date."
        eyebrow="Fleet management"
        title="Buses"
      />
      {error && <Alert>{error}</Alert>}
      {notice && <p className="rounded-xl border border-leaf/20 bg-white px-4 py-3 text-sm text-forest">{notice}</p>}

      {formOpen && (
        <form
          className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-[1fr_180px_auto_auto] sm:items-end"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">Bus number</span>
            <input
              className="form-input"
              maxLength={50}
              onChange={(event) => setBusNumber(event.target.value)}
              placeholder="e.g. WB-12-1234"
              required
              value={busNumber}
            />
          </label>
          {editingBus ? (
            <p className="text-xs leading-5 text-slate-500">
              Current capacity: {editingBus.totalSeats} seats
            </p>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">Total seats</span>
              <input
                className="form-input"
                max={500}
                min={1}
                onChange={(event) => setTotalSeats(event.target.value)}
                required
                type="number"
                value={totalSeats}
              />
            </label>
          )}
          <button
            className="rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white hover:bg-forest-dark disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Saving…" : editingBus ? "Save changes" : "Add bus"}
          </button>
          <button
            aria-label="Close bus form"
            className="flex items-center justify-center rounded-xl border border-stone-200 p-3 text-slate-500 hover:bg-stone-50"
            onClick={() => setFormOpen(false)}
            type="button"
          >
            {formOpen && <X aria-hidden="true" className="h-4 w-4" />}
          </button>
        </form>
      )}

      {loading ? (
        <LoadingScreen label="Loading buses…" />
      ) : !error && buses.length === 0 ? (
        <EmptyState title="No buses in your fleet yet">
          Add a bus to make it available for reservations.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#f8f8f4] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Bus number</th>
                  <th className="px-5 py-3.5 font-semibold">Total seats</th>
                  <th className="px-5 py-3.5 font-semibold">Available</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {buses.map((bus) => (
                  <tr className="text-slate-600" key={bus.id}>
                    <td className="px-5 py-4 font-semibold text-ink">
                      <span className="inline-flex items-center gap-2">
                        <BusFront aria-hidden="true" className="h-4 w-4 text-forest" />
                        {bus.busNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">{bus.totalSeats}</td>
                    <td className="px-5 py-4">{bus.availableSeats}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          aria-label={`Edit ${bus.busNumber}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-stone-100 hover:text-ink"
                          onClick={() => openEditForm(bus)}
                          type="button"
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                        </button>
                        <button
                          aria-label={`Remove ${bus.busNumber}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleDelete(bus)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
