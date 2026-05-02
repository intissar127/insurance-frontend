import React, { useState } from 'react';
import api from '../services/api';
import { X, MapPin, Loader2 } from 'lucide-react';

const ClaimForm = ({ approvedPolicies = [], onSuccess }) => {
    const [formData, setFormData] = useState({
        description: '',
        dateOfIncident: '',
        estimatedAmount: '',
        selectedPolicy: '',
        location: '',
        vehicleDamage: '',
        healthInjury: '',
        propertyDamage: '',
    });

    const [photos, setPhotos] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedPolicyObject = approvedPolicies.find(
        p => p.id === parseInt(formData.selectedPolicy)
    );

    const hasAuto = selectedPolicyObject?.insuranceType?.name?.toLowerCase().includes('auto');
    const hasHealth = selectedPolicyObject?.insuranceType?.name?.toLowerCase().includes('sant');
    const hasHome = selectedPolicyObject?.insuranceType?.name?.toLowerCase().includes('habitation');

    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            setError("La géolocalisation n'est pas supportée par ce navigateur.");
            return;
        }

        setGeoLoading(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = `${pos.coords.latitude}, ${pos.coords.longitude}`;

                setFormData(prev => ({
                    ...prev,
                    location: loc
                }));

                setGeoLoading(false);
            },
            (err) => {
                console.error(err);
                setError("Impossible de récupérer la localisation.");
                setGeoLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000
            }
        );
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);

        setPhotos(files);
        setPreviews(files.map(f => URL.createObjectURL(f)));
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        const data = new FormData();

        data.append('Description', formData.description);
        data.append('DateOfIncident', formData.dateOfIncident);
        data.append('EstimatedAmount', parseFloat(formData.estimatedAmount));
        data.append('Location', formData.location);

        data.append('PolicyIds[0]', parseInt(formData.selectedPolicy));

        photos.forEach(file => {
            data.append('Files', file);
        });

        try {
            await api.post('/Claims', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            onSuccess();
        } catch (err) {
            console.error(err);
            setError("Erreur lors de la création du sinistre.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl">
                    {error}
                </div>
            )}

            <select
                required
                className="w-full p-3 bg-slate-50 rounded-xl"
                value={formData.selectedPolicy}
                onChange={e =>
                    setFormData(prev => ({
                        ...prev,
                        selectedPolicy: e.target.value
                    }))
                }
            >
                <option value="">Choisir un contrat</option>
                {approvedPolicies.map(p => (
                    <option key={p.id} value={p.id}>
                        {p.insuranceType?.name} - {p.policyNumber}
                    </option>
                ))}
            </select>

            <textarea
                required
                placeholder="Description"
                className="w-full p-3 bg-slate-50 rounded-xl"
                value={formData.description}
                onChange={e =>
                    setFormData(prev => ({
                        ...prev,
                        description: e.target.value
                    }))
                }
            />

            <div className="grid grid-cols-2 gap-3">
                <input
                    type="date"
                    required
                    className="p-3 bg-slate-50 rounded-xl"
                    value={formData.dateOfIncident}
                    onChange={e =>
                        setFormData(prev => ({
                            ...prev,
                            dateOfIncident: e.target.value
                        }))
                    }
                />

                <input
                    type="number"
                    required
                    placeholder="Montant"
                    className="p-3 bg-slate-50 rounded-xl"
                    value={formData.estimatedAmount}
                    onChange={e =>
                        setFormData(prev => ({
                            ...prev,
                            estimatedAmount: e.target.value
                        }))
                    }
                />
            </div>

            {hasAuto && (
                <div className="p-4 bg-blue-50 rounded-xl space-y-3">
                    <h3 className="font-bold">🚗 Localisation accident</h3>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Latitude, Longitude"
                            className="flex-1 p-3 rounded-xl border"
                            value={formData.location}
                            onChange={e =>
                                setFormData(prev => ({
                                    ...prev,
                                    location: e.target.value
                                }))
                            }
                        />

                        <button
                            type="button"
                            onClick={handleGeolocation}
                            disabled={geoLoading}
                            className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                        >
                            {geoLoading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <MapPin size={18} />
                            )}
                        </button>
                    </div>
                </div>
            )}

            <div>
                <input
                    type="file"
                    multiple
                    onChange={handlePhotoChange}
                />

                <div className="grid grid-cols-3 gap-2 mt-3">
                    {previews.map((preview, i) => (
                        <div key={i} className="relative">
                            <img
                                src={preview}
                                alt=""
                                className="w-full h-20 object-cover rounded"
                            />

                            <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-3 rounded-xl"
            >
                {loading ? 'Envoi...' : 'Créer le sinistre'}
            </button>

        </form>
    );
};

export default ClaimForm;