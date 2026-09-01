import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Navigation, MapPin, Pencil, Trash2 } from "lucide-react";
import { collectionRouteService } from "../../../api/collectionRoute.service";
import { collectionPointService } from "../../../api/collectionPoint.service";
import { userService } from "../../../api/admin.service";
import { concernService } from "../../../api/concern.service";
import { suggestionService } from "../../../api/suggestion.service";
import { coordsToLocationString } from "../../../api/location.service";

// Sub-components
import RouteList from "./RouteList";
import CollectionPointForm from "./CollectionPointForm";
import InteractiveMap from "./InteractiveMap";
import AssignWorkerModal from "../assignments/AssignWorkerModal";
import { EditPointModal, DeletePointModal } from "./PointModals";
import {
  CreateRouteModal,
  EditRouteModal,
  DeleteRouteModal,
} from "./RouteModals";

// Sequence order calculator: finds the max sequence and adds 1
function getNextSequenceOrder(points = []) {
  if (!Array.isArray(points) || points.length === 0) return 1;
  const maxSeq = points.reduce((max, p) => {
    const seq = parseInt(p?.sequence_order, 10);
    return !isNaN(seq) && seq > max ? seq : max;
  }, 0);
  return maxSeq + 1;
}

export default function RouteManagement({
  fireToast,
  importedPointTarget,
  clearImportedPoint,
  refreshAnalytics,
}) {
  // Routes & Points States
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [loadingPoints, setLoadingPoints] = useState(false);

  // Workers, Concerns & Suggestions for Map Overlay
  const [workersList, setWorkersList] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Map Navigation & Interactive Creation States
  const [mapCenter, setMapCenter] = useState([22.5726, 88.3639]);
  const [isCreatingPoint, setIsCreatingPoint] = useState(false);

  // Form States
  const [newPointForm, setNewPointForm] = useState({
    latitude: "",
    longitude: "",
    sequence_order: "",
    waste_bin_id: "",
  });

  // Modal States
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState({
    name: "",
    description: "",
    worker_id: "",
    route_date: new Date().toISOString().split("T")[0],
  });

  const [editRoute, setEditRoute] = useState(null);
  const [routeToDelete, setRouteToDelete] = useState(null);

  const [editPoint, setEditPoint] = useState(null);
  const [editPointForm, setEditPointForm] = useState({
    latitude: "",
    longitude: "",
    sequence_order: "",
    waste_bin_id: "",
  });
  const [pointToDelete, setPointToDelete] = useState(null);

  // Map Direct Dispatch State
  const [assignItem, setAssignItem] = useState(null);

  // Handle Point Selection by Route
  const handleSelectRoute = useCallback(async (route) => {
    if (!route) return;
    setSelectedRoute(route);
    setLoadingPoints(true);
    try {
      const data = await collectionPointService.getPointsByRoute(route.id);
      const pointsList = Array.isArray(data) ? data : [];
      setRoutePoints(pointsList);

      if (pointsList.length > 0) {
        const first = pointsList[0];
        const lat = first.latitude ?? first.lat;
        const lng = first.longitude ?? first.lng;
        if (lat && lng) setMapCenter([Number(lat), Number(lng)]);
      }
    } catch (err) {
      setRoutePoints([]);
    } finally {
      setLoadingPoints(false);
    }
  }, []);

  // Fetch All Initial Data
  const fetchData = useCallback(async () => {
    try {
      const [routesData, usersData, concernsData, suggestionsData] =
        await Promise.allSettled([
          collectionRouteService.getAllRoutes(),
          userService.getAllUsers(),
          concernService.getAllConcerns(),
          suggestionService.getAllSuggestions(),
        ]);

      // 1. Process Routes
      const routeList =
        routesData.status === "fulfilled" && Array.isArray(routesData.value)
          ? routesData.value
          : [];
      setRoutes(routeList);

      if (routeList.length > 0) {
        handleSelectRoute(routeList[0]);
      } else {
        setSelectedRoute(null);
        setRoutePoints([]);
      }

      // 2. Process Workers
      if (usersData.status === "fulfilled") {
        const rawUsers = Array.isArray(usersData.value)
          ? usersData.value
          : usersData.value?.users || [];
        const workers = rawUsers
          .filter((u) => (u.role || "").toLowerCase() === "worker")
          .map((w) => ({
            id: w.id || w._id,
            name: w.full_name || w.name || "Worker",
            email: w.email,
          }));
        setWorkersList(workers);
      }

      // 3. Process Concerns
      if (concernsData.status === "fulfilled") {
        setConcerns(
          Array.isArray(concernsData.value) ? concernsData.value : []
        );
      }

      // 4. Process Suggestions
      if (suggestionsData.status === "fulfilled") {
        setSuggestions(
          Array.isArray(suggestionsData.value) ? suggestionsData.value : []
        );
      }
    } catch (e) {
      if (fireToast) fireToast("Failed to load map data");
    }
  }, [handleSelectRoute, fireToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Imported Point from Concerns / Suggestions
  useEffect(() => {
    if (importedPointTarget) {
      setNewPointForm((prev) => ({
        ...prev,
        latitude: importedPointTarget.latitude || "",
        longitude: importedPointTarget.longitude || "",
      }));
      if (importedPointTarget.latitude && importedPointTarget.longitude) {
        setMapCenter([
          Number(importedPointTarget.latitude),
          Number(importedPointTarget.longitude),
        ]);
      }
      if (clearImportedPoint) clearImportedPoint();
    }
  }, [importedPointTarget, clearImportedPoint]);

  // Polyline Coordinate Positions
  const polylinePositions = useMemo(() => {
    const points = Array.isArray(routePoints) ? routePoints : [];
    return points
      .map((p) => {
        const lat = p?.latitude ?? p?.lat;
        const lng = p?.longitude ?? p?.lng;
        return lat && lng ? [Number(lat), Number(lng)] : null;
      })
      .filter(Boolean);
  }, [routePoints]);

  // Route Actions
  const handleCreateRoute = async () => {
    if (!newRouteForm.name.trim()) {
      if (fireToast) fireToast("Please enter a route name.");
      return;
    }
    if (!newRouteForm.worker_id) {
      if (fireToast) fireToast("Please assign a worker to this route.");
      return;
    }

    try {
      const createdRoute = await collectionRouteService.createRoute({
        name: newRouteForm.name.trim(),
        description:
          newRouteForm.description.trim() || "City Waste Collection Route",
        worker_id: parseInt(newRouteForm.worker_id, 10),
        route_date: newRouteForm.route_date,
      });

      if (fireToast) fireToast("New collection route created!");
      setShowCreateRouteModal(false);
      setNewRouteForm({
        name: "",
        description: "",
        worker_id: "",
        route_date: new Date().toISOString().split("T")[0],
      });

      const updatedRoutes = await collectionRouteService.getAllRoutes();
      const list = Array.isArray(updatedRoutes) ? updatedRoutes : [];
      setRoutes(list);

      if (createdRoute) {
        handleSelectRoute(createdRoute);
      }
      if (refreshAnalytics) refreshAnalytics();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (fireToast) {
        fireToast(
          typeof detail === "string"
            ? detail
            : "Failed to create collection route"
        );
      }
    }
  };

  const handleSaveEditRoute = async () => {
    if (!editRoute || !editRoute.route_name.trim()) {
      if (fireToast) fireToast("Route name is required.");
      return;
    }
    try {
      await collectionRouteService.updateRoute(editRoute.id, {
        route_name: editRoute.route_name.trim(),
        route_date: editRoute.route_date,
      });
      if (fireToast) fireToast("Route updated successfully!");
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === editRoute.id
            ? {
                ...r,
                route_name: editRoute.route_name,
                name: editRoute.route_name,
                route_date: editRoute.route_date,
              }
            : r
        )
      );
      if (selectedRoute?.id === editRoute.id) {
        setSelectedRoute((prev) => ({
          ...prev,
          route_name: editRoute.route_name,
          name: editRoute.route_name,
          route_date: editRoute.route_date,
        }));
      }
      setEditRoute(null);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (fireToast) {
        fireToast(
          typeof detail === "string" ? detail : "Failed to update route"
        );
      }
    }
  };

  const handleDeleteRoute = async () => {
    if (!routeToDelete) return;
    try {
      await collectionRouteService.deleteRoute(routeToDelete.id);
      if (fireToast)
        fireToast(`Route #${routeToDelete.id} deleted successfully!`);
      setRouteToDelete(null);
      const updatedRoutes = await collectionRouteService.getAllRoutes();
      const list = Array.isArray(updatedRoutes) ? updatedRoutes : [];
      setRoutes(list);
      if (list.length > 0) {
        handleSelectRoute(list[0]);
      } else {
        setSelectedRoute(null);
        setRoutePoints([]);
      }
      if (refreshAnalytics) refreshAnalytics();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (fireToast) {
        fireToast(
          typeof detail === "string" ? detail : "Failed to delete route"
        );
      }
    }
  };

  const handleToggleRouteStatus = async (routeId, currentStatus) => {
    const nextStatus =
      currentStatus === "Active" || currentStatus === "active"
        ? "Inactive"
        : "Active";
    try {
      await collectionRouteService.updateRouteStatus(
        routeId,
        nextStatus.toLowerCase()
      );
      setRoutes((prev) =>
        prev.map((r) => (r.id === routeId ? { ...r, status: nextStatus } : r))
      );
      if (selectedRoute?.id === routeId) {
        setSelectedRoute((prev) => ({ ...prev, status: nextStatus }));
      }
      if (fireToast) fireToast(`Route marked as ${nextStatus}`);
    } catch (err) {
      if (fireToast) fireToast("Failed to update route status");
    }
  };

  // Map Click Handler
  const handleMapClick = (latlng) => {
    setNewPointForm((prev) => ({
      ...prev,
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6),
    }));
  };

  // Collection Point Actions
  const handleCreateCollectionPoint = async () => {
    if (!selectedRoute?.id) {
      if (fireToast)
        fireToast("Please select an active route from the list first.");
      return;
    }
    if (!newPointForm.latitude || !newPointForm.longitude) {
      if (fireToast)
        fireToast("Please provide valid latitude and longitude coordinates.");
      return;
    }

    const lat = parseFloat(newPointForm.latitude);
    const lng = parseFloat(newPointForm.longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      if (fireToast) fireToast("Invalid coordinate ranges.");
      return;
    }

    const safeSequence =
      newPointForm.sequence_order &&
      String(newPointForm.sequence_order).trim() !== ""
        ? parseInt(newPointForm.sequence_order, 10)
        : getNextSequenceOrder(routePoints);

    try {
      const pointPayload = {
        route_id: parseInt(selectedRoute.id, 10),
        latitude: lat,
        longitude: lng,
        sequence_order: safeSequence,
      };

      if (
        newPointForm.waste_bin_id &&
        String(newPointForm.waste_bin_id).trim()
      ) {
        pointPayload.waste_bin_id = String(newPointForm.waste_bin_id).trim();
      }

      await collectionPointService.createPoint(pointPayload);
      if (fireToast)
        fireToast(`Collection point added as Stop #${safeSequence}!`);

      setIsCreatingPoint(false);
      setNewPointForm({
        latitude: "",
        longitude: "",
        sequence_order: "",
        waste_bin_id: "",
      });

      await handleSelectRoute(selectedRoute);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = Array.isArray(detail)
        ? detail[0]?.msg || "Validation error"
        : typeof detail === "string"
        ? detail
        : "Failed to create collection point";
      if (fireToast) fireToast(errorMsg);
    }
  };

  const handleOpenEditPointModal = (point) => {
    const lat = point.latitude ?? point.lat;
    const lng = point.longitude ?? point.lng;
    setEditPoint(point);
    setEditPointForm({
      latitude: lat != null ? String(lat) : "",
      longitude: lng != null ? String(lng) : "",
      sequence_order:
        point.sequence_order != null ? String(point.sequence_order) : "1",
      waste_bin_id: point.waste_bin_id || "",
    });
  };

  const handleSaveEditPoint = async () => {
    if (!editPoint) return;
    const lat = parseFloat(editPointForm.latitude);
    const lng = parseFloat(editPointForm.longitude);

    if (
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      if (fireToast) fireToast("Invalid coordinate ranges.");
      return;
    }

    try {
      await collectionPointService.updatePoint(editPoint.id, {
        latitude: lat,
        longitude: lng,
        sequence_order:
          parseInt(editPointForm.sequence_order, 10) ||
          editPoint.sequence_order,
        waste_bin_id: editPointForm.waste_bin_id
          ? String(editPointForm.waste_bin_id).trim()
          : null,
      });

      if (fireToast) fireToast(`Stop #${editPoint.id} updated!`);
      setEditPoint(null);
      handleSelectRoute(selectedRoute);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (fireToast) {
        fireToast(
          typeof detail === "string"
            ? detail
            : "Failed to update collection point"
        );
      }
    }
  };

  const handleDeleteCollectionPoint = async () => {
    if (!pointToDelete) return;
    try {
      await collectionPointService.deletePoint(pointToDelete.id);
      if (fireToast) fireToast(`Stop #${pointToDelete.id} deleted!`);
      setPointToDelete(null);
      handleSelectRoute(selectedRoute);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (fireToast) {
        fireToast(
          typeof detail === "string"
            ? detail
            : "Failed to delete collection point"
        );
      }
    }
  };

  const handleTogglePointStatus = async (point) => {
    try {
      const nextCollected = !(
        Boolean(point.is_collected) || point.status === "collected"
      );
      await collectionPointService.updatePoint(point.id, {
        is_collected: nextCollected,
      });
      if (fireToast) {
        fireToast(
          `Stop #${point.id} marked as ${
            nextCollected ? "Collected" : "Pending"
          }`
        );
      }
      handleSelectRoute(selectedRoute);
    } catch (err) {
      if (fireToast) fireToast("Failed to update point status");
    }
  };

  const handleAddMapItemToRoute = (title, coords) => {
    if (!selectedRoute?.id) {
      if (fireToast) fireToast("Please select a route from the list first!");
      return;
    }
    if (!coords || isNaN(coords.lat) || isNaN(coords.lng)) {
      if (fireToast) fireToast("Invalid location coordinates.");
      return;
    }
    setNewPointForm((prev) => ({
      ...prev,
      latitude: String(coords.lat),
      longitude: String(coords.lng),
    }));
    if (fireToast) fireToast(`Coordinates loaded into Point Form`);
  };

  return (
    <div className="relative bg-white/85 backdrop-blur-xl rounded-3xl shadow-xl ring-1 ring-white/60 border border-white/40 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0B3D2E]">
              Collection Routes & Interactive Map
            </h1>
            <p className="text-sm text-gray-500">
              Manage collection routes, edit/delete routes, and plot collection
              points.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Routes List & Point Creation Form */}
        <div className="space-y-4">
          <RouteList
            routes={routes}
            selectedRoute={selectedRoute}
            onSelectRoute={handleSelectRoute}
            onOpenCreateRoute={() => setShowCreateRouteModal(true)}
            onOpenEditRoute={(r) =>
              setEditRoute({
                id: r.id,
                route_name: r.route_name || r.name || "",
                route_date: r.route_date
                  ? r.route_date.split("T")[0]
                  : new Date().toISOString().split("T")[0],
              })
            }
            onOpenDeleteRoute={(r) => setRouteToDelete(r)}
            onToggleRouteStatus={handleToggleRouteStatus}
          />

          <CollectionPointForm
            isCreatingPoint={isCreatingPoint}
            setIsCreatingPoint={setIsCreatingPoint}
            newPointForm={newPointForm}
            setNewPointForm={setNewPointForm}
            onSubmitPoint={handleCreateCollectionPoint}
            routePoints={routePoints}
          />
        </div>

        {/* Right Column: Interactive Map & Points Sequence Table */}
        <div className="lg:col-span-2 space-y-4">
          <InteractiveMap
            mapCenter={mapCenter}
            isCreatingPoint={isCreatingPoint}
            onMapClick={handleMapClick}
            concerns={concerns}
            suggestions={suggestions}
            routePoints={routePoints}
            polylinePositions={polylinePositions}
            newPointForm={newPointForm}
            onAddLocationToRoute={handleAddMapItemToRoute}
            onAssignItem={(item) => setAssignItem(item)}
            onEditPoint={handleOpenEditPointModal}
            onDeletePoint={(point) => setPointToDelete(point)}
            onTogglePointStatus={handleTogglePointStatus}
          />

          {/* Point Status Table */}
          {selectedRoute && (
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#0B3D2E]">
                  Collection Points for{" "}
                  {selectedRoute.route_name ||
                    selectedRoute.name ||
                    `Route #${selectedRoute.id}`}{" "}
                  ({(routePoints || []).length})
                </h4>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                {loadingPoints ? (
                  <p className="text-xs text-gray-400 text-center py-2">
                    Loading collection points...
                  </p>
                ) : (routePoints || []).length > 0 ? (
                  routePoints.map((point) => {
                    const lat = point.latitude ?? point.lat;
                    const lng = point.longitude ?? point.lng;
                    const isCollected =
                      point.is_collected || point.status === "collected";

                    return (
                      <div
                        key={point.id}
                        className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin
                            className={`w-4 h-4 ${
                              isCollected
                                ? "text-emerald-500"
                                : "text-amber-500"
                            }`}
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              Stop #{point.id}{" "}
                              <span className="text-[10px] text-gray-400 font-normal">
                                (Seq #{point.sequence_order})
                              </span>
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">
                              {lat && lng
                                ? coordsToLocationString(
                                    Number(lat).toFixed(4),
                                    Number(lng).toFixed(4)
                                  )
                                : "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold mr-1 ${
                              isCollected
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {isCollected ? "Collected" : "Pending"}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEditPointModal(point)}
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-200 rounded-lg transition"
                            title="Edit Point"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setPointToDelete(point)}
                            className="p-1.5 text-red-500 hover:bg-red-50 border border-red-200 rounded-lg transition"
                            title="Delete Point"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">
                    No collection points assigned to this route yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRouteModal
        open={showCreateRouteModal}
        onClose={() => setShowCreateRouteModal(false)}
        newRouteForm={newRouteForm}
        setNewRouteForm={setNewRouteForm}
        workersList={workersList}
        onCreateRoute={handleCreateRoute}
      />

      <EditRouteModal
        editRoute={editRoute}
        setEditRoute={setEditRoute}
        onClose={() => setEditRoute(null)}
        onSave={handleSaveEditRoute}
      />

      <DeleteRouteModal
        routeToDelete={routeToDelete}
        onClose={() => setRouteToDelete(null)}
        onConfirm={handleDeleteRoute}
      />

      <EditPointModal
        editPoint={editPoint}
        editPointForm={editPointForm}
        setEditPointForm={setEditPointForm}
        onClose={() => setEditPoint(null)}
        onSave={handleSaveEditPoint}
      />

      <DeletePointModal
        pointToDelete={pointToDelete}
        onClose={() => setPointToDelete(null)}
        onConfirm={handleDeleteCollectionPoint}
      />

      {/* Dispatch to Worker Modal from Map popup */}
      {assignItem && (
        <AssignWorkerModal
          targetItem={assignItem}
          workersList={workersList}
          onClose={() => setAssignItem(null)}
          onSuccess={() => {
            fetchData();
            if (refreshAnalytics) refreshAnalytics();
          }}
          fireToast={fireToast}
        />
      )}
    </div>
  );
}