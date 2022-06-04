export default {
    state: {
        // Отображать интервал Timemachine
        isVisibleTimeRange: false,
        // События трансформаций
        changes: [],
        // Интервал дат в машине времени
        dateFrom: new Date(),
        dateTo: new Date()
    },

    mutations: {
        setVisibleTimeRange(state, value) {
            state.isVisibleTimeRange = value;
        },
        setTimeMachineChanges(state, value) {
            state.changes = value;
        },
        setTimeMachineDateFrom(state, value) {
            state.dateFrom = value;
        },
        setTimeMachineDateTo(state, value) {
            state.dateTo = value;
        },
    },

    actions: {
    }
};
