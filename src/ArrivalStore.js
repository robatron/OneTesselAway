const { getUpcomingArrivalTimes } = require('./ArrivalsAndStops');

// Main arrival info cache
let arrivalInfo = {};

// Updates the arrival info in memory. If an update fails, log an error
// and move on.
const updateArrivalInfo = async targetRoutes => {
    const targetRouteIds = Object.keys(targetRoutes);

    for (let i = 0; i < targetRouteIds.length; ++i) {
        const currentDate = new Date();
        const routeId = targetRouteIds[i];
        const routeName = targetRoutes[routeId].routeName;
        const stopId = targetRoutes[routeId].stopId;
        const stopName = targetRoutes[routeId].stopName;
        let upcomingArrivalTimes;

        try {
            upcomingArrivalTimes = await getUpcomingArrivalTimes(
                stopId,
                routeId,
                currentDate,
            );
        } catch (e) {
            log.error(
                `Failed to get upcoming arrival times for route ${routeId} and stop ${stopId}: ${e.toString()}`,
            );
        }

        if (upcomingArrivalTimes) {
            arrivalInfo[routeId] = {
                lastUpdatedDate: currentDate,
                routeName,
                stopName,
                upcomingArrivalTimes,
            };
        }
    }
};

module.exports = {
    getArrivalInfo: () => arrivalInfo,
    updateArrivalInfo,
};
