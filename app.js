document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const currentDateEl = document.getElementById('current-date');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const addWaterBtn = document.getElementById('add-water');
    const waterAmountEl = document.getElementById('water-amount');
    const activityListEl = document.getElementById('activity-list');
    const workoutListEl = document.getElementById('workout-list');
    const mealListEl = document.getElementById('meal-list');
    const todayWorkoutEl = document.getElementById('today-workout');
    const caloriesBurnedEl = document.getElementById('calories-burned');
    const currentWeightEl = document.getElementById('current-weight');
    const caloriesConsumedEl = document.getElementById('calories-consumed');
    const caloriesRemainingEl = document.getElementById('calories-remaining');
    const totalWorkoutsEl = document.getElementById('total-workouts');
    const weightChangeEl = document.getElementById('weight-change');
    const avgWorkoutsEl = document.getElementById('avg-workouts');
    const progressTimeframeEl = document.getElementById('progress-timeframe');
    
    // Modal Elements
    const workoutModal = document.getElementById('workout-modal');
    const mealModal = document.getElementById('meal-modal');
    const weightModal = document.getElementById('weight-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const logWorkoutBtn = document.getElementById('log-workout-btn');
    const logMealBtn = document.getElementById('log-meal-btn');
    const addWeightBtn = document.getElementById('add-weight-btn');
    const addWorkoutBtn = document.getElementById('add-workout-btn');
    const addMealBtn = document.getElementById('add-meal-btn');
    
    // Form Elements
    const workoutForm = document.getElementById('workout-form');
    const mealForm = document.getElementById('meal-form');
    const weightForm = document.getElementById('weight-form');
    
    // Chart Elements
    const weightChartCtx = document.getElementById('weight-chart').getContext('2d');
    const workoutChartCtx = document.getElementById('workout-chart').getContext('2d');
    
    // App State
    let state = {
        workouts: [],
        meals: [],
        waterIntake: 0,
        weightEntries: [],
        dailyCalorieGoal: 2000,
        activityLog: []
    };
    
    // Initialize the app
    function init() {
        // Load data from localStorage
        loadData();
        
        // Set current date
        updateCurrentDate();
        
        // Setup event listeners
        setupEventListeners();
        
        // Render initial data
        renderDashboard();
        renderWorkouts();
        renderMeals();
        renderProgress();
        
        // Initialize charts
        initCharts();
    }
    
    // Load data from localStorage
    function loadData() {
        const savedState = localStorage.getItem('fitnessTrackerState');
        if (savedState) {
            state = JSON.parse(savedState);
        } else {
            // Initialize with some sample data if no saved data exists
            state.workouts = [
                {
                    id: generateId(),
                    type: 'Running',
                    duration: 30,
                    intensity: 'Moderate',
                    calories: 300,
                    date: getFormattedDate(new Date()),
                    notes: 'Morning run in the park'
                }
            ];
            
            state.meals = [
                {
                    id: generateId(),
                    type: 'Breakfast',
                    name: 'Oatmeal with fruits',
                    calories: 350,
                    protein: 12,
                    carbs: 60,
                    fat: 8,
                    date: getFormattedDate(new Date())
                }
            ];
            
            state.weightEntries = [
                {
                    id: generateId(),
                    weight: 70,
                    date: getFormattedDate(new Date())
                }
            ];
            
            state.activityLog = [
                {
                    id: generateId(),
                    type: 'workout',
                    message: 'Logged Running workout',
                    date: getFormattedDate(new Date()),
                    time: getCurrentTime()
                },
                {
                    id: generateId(),
                    type: 'meal',
                    message: 'Logged Breakfast: Oatmeal with fruits',
                    date: getFormattedDate(new Date()),
                    time: getCurrentTime()
                }
            ];
            
            saveData();
        }
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('fitnessTrackerState', JSON.stringify(state));
    }
    
    // Update current date display
    function updateCurrentDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Tab navigation
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
        // Water intake
        addWaterBtn.addEventListener('click', () => {
            state.waterIntake += 1;
            waterAmountEl.textContent = state.waterIntake;
            logActivity('water', `Added water intake: ${state.waterIntake} glasses`);
            saveData();
        });
        
        // Modal open buttons
        logWorkoutBtn.addEventListener('click', () => openModal('workout'));
        addWorkoutBtn.addEventListener('click', () => openModal('workout'));
        logMealBtn.addEventListener('click', () => openModal('meal'));
        addMealBtn.addEventListener('click', () => openModal('meal'));
        addWeightBtn.addEventListener('click', () => openModal('weight'));
        
        // Modal close buttons
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                workoutModal.style.display = 'none';
                mealModal.style.display = 'none';
                weightModal.style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === workoutModal) workoutModal.style.display = 'none';
            if (e.target === mealModal) mealModal.style.display = 'none';
            if (e.target === weightModal) weightModal.style.display = 'none';
        });
        
        // Form submissions
        workoutForm.addEventListener('submit', handleWorkoutSubmit);
        mealForm.addEventListener('submit', handleMealSubmit);
        weightForm.addEventListener('submit', handleWeightSubmit);
        
        // Progress timeframe change
        progressTimeframeEl.addEventListener('change', renderProgress);
    }
    
    // Switch between tabs
    function switchTab(tabId) {
        // Update active tab button
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-tab') === tabId) {
                button.classList.add('active');
            }
        });
        
        // Update active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
                
                // Refresh the content if needed
                if (tabId === 'dashboard') renderDashboard();
                if (tabId === 'workouts') renderWorkouts();
                if (tabId === 'nutrition') renderMeals();
                if (tabId === 'progress') renderProgress();
            }
        });
    }
    
    // Open modal
    function openModal(modalType) {
        if (modalType === 'workout') {
            // Reset form
            workoutForm.reset();
            // Set default date to today
            workoutModal.style.display = 'flex';
        } else if (modalType === 'meal') {
            mealForm.reset();
            mealModal.style.display = 'flex';
        } else if (modalType === 'weight') {
            weightForm.reset();
            document.getElementById('weight-date').valueAsDate = new Date();
            weightModal.style.display = 'flex';
        }
    }
    
    // Handle workout form submission
    function handleWorkoutSubmit(e) {
        e.preventDefault();
        
        const workoutType = document.getElementById('workout-type').value;
        const duration = parseInt(document.getElementById('workout-duration').value);
        const intensity = document.getElementById('workout-intensity').value;
        const calories = document.getElementById('workout-calories').value ? 
            parseInt(document.getElementById('workout-calories').value) : 
            calculateCaloriesBurned(workoutType, duration, intensity);
        const notes = document.getElementById('workout-notes').value;
        
        const newWorkout = {
            id: generateId(),
            type: workoutType,
            duration: duration,
            intensity: intensity,
            calories: calories,
            date: getFormattedDate(new Date()),
            notes: notes
        };
        
        state.workouts.unshift(newWorkout);
        logActivity('workout', `Logged ${workoutType} workout`);
        saveData();
        
        workoutModal.style.display = 'none';
        renderDashboard();
        renderWorkouts();
        renderProgress();
    }
    
    // Handle meal form submission
    function handleMealSubmit(e) {
        e.preventDefault();
        
        const mealType = document.getElementById('meal-type').value;
        const mealName = document.getElementById('meal-name').value;
        const calories = parseInt(document.getElementById('meal-calories').value);
        const protein = document.getElementById('meal-protein').value ? 
            parseInt(document.getElementById('meal-protein').value) : 0;
        const carbs = document.getElementById('meal-carbs').value ? 
            parseInt(document.getElementById('meal-carbs').value) : 0;
        const fat = document.getElementById('meal-fat').value ? 
            parseInt(document.getElementById('meal-fat').value) : 0;
        
        const newMeal = {
            id: generateId(),
            type: mealType,
            name: mealName,
            calories: calories,
            protein: protein,
            carbs: carbs,
            fat: fat,
            date: getFormattedDate(new Date())
        };
        
        state.meals.unshift(newMeal);
        logActivity('meal', `Logged ${mealType}: ${mealName}`);
        saveData();
        
        mealModal.style.display = 'none';
        renderDashboard();
        renderMeals();
    }
    
    // Handle weight form submission
    function handleWeightSubmit(e) {
        e.preventDefault();
        
        const weight = parseFloat(document.getElementById('weight-value').value);
        const date = document.getElementById('weight-date').value;
        
        const newWeightEntry = {
            id: generateId(),
            weight: weight,
            date: date
        };
        
        // Check if there's already an entry for this date
        const existingIndex = state.weightEntries.findIndex(entry => entry.date === date);
        if (existingIndex >= 0) {
            state.weightEntries[existingIndex] = newWeightEntry;
        } else {
            state.weightEntries.unshift(newWeightEntry);
        }
        
        // Sort weight entries by date (newest first)
        state.weightEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        logActivity('weight', `Logged weight: ${weight} kg`);
        saveData();
        
        weightModal.style.display = 'none';
        renderDashboard();
        renderProgress();
    }
    
    // Calculate calories burned based on workout type, duration, and intensity
    function calculateCaloriesBurned(type, duration, intensity) {
        // Base MET values for different activities
        const metValues = {
            'Running': { 'Light': 6, 'Moderate': 8, 'Vigorous': 10 },
            'Cycling': { 'Light': 4, 'Moderate': 6, 'Vigorous': 8 },
            'Swimming': { 'Light': 5, 'Moderate': 7, 'Vigorous': 9 },
            'Weight Training': { 'Light': 3, 'Moderate': 5, 'Vigorous': 7 },
            'Yoga': { 'Light': 2, 'Moderate': 3, 'Vigorous': 4 },
            'HIIT': { 'Light': 6, 'Moderate': 8, 'Vigorous': 10 },
            'Walking': { 'Light': 2, 'Moderate': 3, 'Vigorous': 4 },
            'Other': { 'Light': 3, 'Moderate': 4, 'Vigorous': 5 }
        };
        
        // Default to average weight of 70kg
        const weightKg = 70;
        const met = metValues[type] ? metValues[type][intensity] : 4;
        
        // Calories burned = MET * weight in kg * time in hours
        return Math.round(met * weightKg * (duration / 60));
    }
    
    // Log activity
    function logActivity(type, message) {
        const newActivity = {
            id: generateId(),
            type: type,
            message: message,
            date: getFormattedDate(new Date()),
            time: getCurrentTime()
        };
        
        state.activityLog.unshift(newActivity);
        
        // Keep only the last 10 activities
        if (state.activityLog.length > 10) {
            state.activityLog.pop();
        }
    }
    
    // Render dashboard
    function renderDashboard() {
        const today = getFormattedDate(new Date());
        
        // Today's workout
        const todaysWorkouts = state.workouts.filter(workout => workout.date === today);
        if (todaysWorkouts.length > 0) {
            const mainWorkout = todaysWorkouts[0];
            todayWorkoutEl.textContent = `${mainWorkout.type} (${mainWorkout.duration} min)`;
        } else {
            todayWorkoutEl.textContent = 'No workout logged';
        }
        
        // Calories burned today
        const caloriesBurnedToday = todaysWorkouts.reduce((sum, workout) => sum + workout.calories, 0);
        caloriesBurnedEl.textContent = caloriesBurnedToday;
        
        // Water intake
        waterAmountEl.textContent = state.waterIntake;
        
        // Current weight (latest entry)
        if (state.weightEntries.length > 0) {
            currentWeightEl.textContent = `${state.weightEntries[0].weight} kg`;
        } else {
            currentWeightEl.textContent = '-- kg';
        }
        
        // Calories consumed today
        const todaysMeals = state.meals.filter(meal => meal.date === today);
        const caloriesConsumedToday = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
        caloriesConsumedEl.textContent = caloriesConsumedToday;
        
        // Calories remaining
        const remaining = state.dailyCalorieGoal - caloriesConsumedToday;
        caloriesRemainingEl.textContent = remaining >= 0 ? remaining : 0;
        
        // Activity log
        renderActivityLog();
    }
    
    // Render activity log
    function renderActivityLog() {
        activityListEl.innerHTML = '';
        
        state.activityLog.forEach(activity => {
            const li = document.createElement('li');
            
            const messageSpan = document.createElement('span');
            messageSpan.textContent = activity.message;
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'activity-time';
            timeSpan.textContent = activity.time;
            
            li.appendChild(messageSpan);
            li.appendChild(timeSpan);
            activityListEl.appendChild(li);
        });
    }
    
    // Render workouts
    function renderWorkouts() {
        workoutListEl.innerHTML = '';
        
        if (state.workouts.length === 0) {
            workoutListEl.innerHTML = '<p class="no-data">No workouts logged yet.</p>';
            return;
        }
        
        state.workouts.forEach(workout => {
            const workoutItem = document.createElement('div');
            workoutItem.className = 'workout-item';
            
            const workoutInfo = document.createElement('div');
            workoutInfo.className = 'workout-info';
            
            const workoutType = document.createElement('span');
            workoutType.className = 'workout-type';
            workoutType.textContent = workout.type;
            
            const workoutDetails = document.createElement('div');
            workoutDetails.className = 'workout-details';
            
            const durationSpan = document.createElement('span');
            durationSpan.textContent = `${workout.duration} min`;
            
            const intensitySpan = document.createElement('span');
            intensitySpan.textContent = workout.intensity;
            
            const caloriesSpan = document.createElement('span');
            caloriesSpan.textContent = `${workout.calories} cal`;
            
            workoutDetails.appendChild(durationSpan);
            workoutDetails.appendChild(intensitySpan);
            workoutDetails.appendChild(caloriesSpan);
            
            workoutInfo.appendChild(workoutType);
            workoutInfo.appendChild(workoutDetails);
            
            const workoutActions = document.createElement('div');
            workoutActions.className = 'workout-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteWorkout(workout.id));
            
            workoutActions.appendChild(deleteBtn);
            
            workoutItem.appendChild(workoutInfo);
            workoutItem.appendChild(workoutActions);
            
            workoutListEl.appendChild(workoutItem);
        });
    }
    
    // Render meals
    function renderMeals() {
        mealListEl.innerHTML = '';
        
        if (state.meals.length === 0) {
            mealListEl.innerHTML = '<p class="no-data">No meals logged yet.</p>';
            return;
        }
        
        const today = getFormattedDate(new Date());
        const todaysMeals = state.meals.filter(meal => meal.date === today);
        
        if (todaysMeals.length === 0) {
            mealListEl.innerHTML = '<p class="no-data">No meals logged for today.</p>';
            return;
        }
        
        todaysMeals.forEach(meal => {
            const mealItem = document.createElement('div');
            mealItem.className = 'meal-item';
            
            const mealInfo = document.createElement('div');
            mealInfo.className = 'meal-info';
            
            const mealType = document.createElement('span');
            mealType.className = 'meal-type';
            mealType.textContent = meal.type;
            
            const mealName = document.createElement('span');
            mealName.className = 'meal-name';
            mealName.textContent = meal.name;
            
            mealInfo.appendChild(mealType);
            mealInfo.appendChild(mealName);
            
            const mealNutrition = document.createElement('div');
            mealNutrition.className = 'meal-nutrition';
            
            const caloriesSpan = document.createElement('span');
            caloriesSpan.className = 'meal-calories';
            caloriesSpan.textContent = `${meal.calories} cal`;
            
            const proteinSpan = document.createElement('span');
            proteinSpan.textContent = `P: ${meal.protein}g`;
            
            const carbsSpan = document.createElement('span');
            carbsSpan.textContent = `C: ${meal.carbs}g`;
            
            const fatSpan = document.createElement('span');
            fatSpan.textContent = `F: ${meal.fat}g`;
            
            mealNutrition.appendChild(caloriesSpan);
            mealNutrition.appendChild(proteinSpan);
            mealNutrition.appendChild(carbsSpan);
            mealNutrition.appendChild(fatSpan);
            
            const mealActions = document.createElement('div');
            mealActions.className = 'workout-actions';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteMeal(meal.id));
            
            mealActions.appendChild(deleteBtn);
            
            mealItem.appendChild(mealInfo);
            mealItem.appendChild(mealNutrition);
            mealItem.appendChild(mealActions);
            
            mealListEl.appendChild(mealItem);
        });
    }
    
    // Render progress
    function renderProgress() {
        const timeframe = parseInt(progressTimeframeEl.value);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - timeframe);
        
        // Filter weight entries within timeframe
        const filteredWeights = state.weightEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });
        
        // Filter workouts within timeframe
        const filteredWorkouts = state.workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= startDate && workoutDate <= endDate;
        });
        
        // Calculate stats
        totalWorkoutsEl.textContent = filteredWorkouts.length;
        
        if (filteredWeights.length >= 2) {
            const weightChange = filteredWeights[0].weight - filteredWeights[filteredWeights.length - 1].weight;
            weightChangeEl.textContent = `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg`;
            weightChangeEl.style.color = weightChange < 0 ? 'green' : weightChange > 0 ? 'red' : 'inherit';
        } else {
            weightChangeEl.textContent = '--';
        }
        
        avgWorkoutsEl.textContent = (filteredWorkouts.length / (timeframe / 7)).toFixed(1);
        
        // Update charts
        updateWeightChart(filteredWeights);
        updateWorkoutChart(filteredWorkouts, startDate, endDate);
    }
    
    // Initialize charts
    function initCharts() {
        window.weightChart = new Chart(weightChartCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} kg`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
        
        window.workoutChart = new Chart(workoutChartCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Workouts per week',
                    data: [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // Update weight chart
    function updateWeightChart(weightEntries) {
        // Sort by date ascending
        const sortedWeights = [...weightEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const labels = sortedWeights.map(entry => {
            const date = new Date(entry.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        const data = sortedWeights.map(entry => entry.weight);
        
        window.weightChart.data.labels = labels;
        window.weightChart.data.datasets[0].data = data;
        window.weightChart.update();
    }
    
    // Update workout chart
    function updateWorkoutChart(workouts, startDate, endDate) {
        // Group workouts by week
        const weeks = [];
        const weekCounts = [];
        
        // Initialize weeks array
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const weekStart = new Date(currentDate);
            const weekEnd = new Date(currentDate);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            if (weekEnd > endDate) weekEnd = endDate;
            
            weeks.push({
                start: new Date(weekStart),
                end: new Date(weekEnd),
                count: 0
            });
            
            currentDate.setDate(currentDate.getDate() + 7);
        }
        
        // Count workouts in each week
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            for (let i = 0; i < weeks.length; i++) {
                if (workoutDate >= weeks[i].start && workoutDate <= weeks[i].end) {
                    weeks[i].count++;
                    break;
                }
            }
        });
        
        // Prepare chart data
        const labels = weeks.map((week, index) => {
            if (weeks.length <= 4 || index % 2 === 0 || index === weeks.length - 1) {
                return `Week ${index + 1}`;
            }
            return '';
        });
        
        const data = weeks.map(week => week.count);
        
        window.workoutChart.data.labels = labels;
        window.workoutChart.data.datasets[0].data = data;
        window.workoutChart.update();
    }
    
    // Delete workout
    function deleteWorkout(id) {
        state.workouts = state.workouts.filter(workout => workout.id !== id);
        logActivity('workout', 'Deleted a workout');
        saveData();
        renderDashboard();
        renderWorkouts();
        renderProgress();
    }
    
    // Delete meal
    function deleteMeal(id) {
        state.meals = state.meals.filter(meal => meal.id !== id);
        logActivity('meal', 'Deleted a meal');
        saveData();
        renderDashboard();
        renderMeals();
    }
    
    // Helper functions
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function getFormattedDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Initialize the app
    init();
});