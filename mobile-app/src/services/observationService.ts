import apiClient from "./apiClient";

const observationService = {
    async createObservation(observationData: any) {
        const formData = new FormData();

        formData.append("userId", observationData.userId);
        if (observationData.lat) formData.append("lat", observationData.lat);
        if (observationData.lng) formData.append("lng", observationData.lng);
        if (observationData.locationName) formData.append("locationName", observationData.locationName);
        if (observationData.legend) formData.append("legend", observationData.legend);

        // Ajout de l'image
        if (observationData.imageUri) {
            const filename = observationData.imageUri.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append("image", {
                uri: observationData.imageUri,
                name: filename,
                type,
            });
        }

        const response = await apiClient.post("/observations", formData, {
            headers: {"Content-Type": "multipart/form-data"},
        });

        return response.data;
    },

    async getObservationsByUser(userId) {
        const response = await apiClient.get(`/observation/user/${userId}`);
        return response.data;
    },

    async deleteObservation(observationId) {
        const response = await apiClient.delete(`/observation/${observationId}`);
        return response.data;
    },
};

export default observationService;