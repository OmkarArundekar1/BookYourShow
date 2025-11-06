// BookYourShow Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form validation enhancement
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Loading button states
    document.querySelectorAll('form').forEach(function(form) {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="loading"></span> Processing...';
                submitBtn.disabled = true;
                
                // Re-enable after 10 seconds as fallback
                setTimeout(function() {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 10000);
            }
        });
    });

    // Movie search functionality
    const searchInput = document.getElementById('search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                filterMovies();
            }, 300);
        });
    }

    // Genre and rating filters
    const genreSelect = document.getElementById('genre');
    const ratingSelect = document.getElementById('rating');
    
    if (genreSelect) {
        genreSelect.addEventListener('change', filterMovies);
    }
    
    if (ratingSelect) {
        ratingSelect.addEventListener('change', filterMovies);
    }
});

// Movie filtering function
function filterMovies() {
    const searchTerm = document.getElementById('search')?.value.toLowerCase() || '';
    const selectedGenre = document.getElementById('genre')?.value || '';
    const selectedRating = document.getElementById('rating')?.value || '';
    
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(function(card) {
        const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
        const genre = card.querySelector('.card-text')?.textContent.toLowerCase() || '';
        const ratingBadge = card.querySelector('.movie-rating .badge')?.textContent || '';
        const rating = parseFloat(ratingBadge.replace('★', '').trim()) || 0;
        
        let showCard = true;
        
        // Search filter
        if (searchTerm && !title.includes(searchTerm)) {
            showCard = false;
        }
        
        // Genre filter
        if (selectedGenre && !genre.includes(selectedGenre.toLowerCase())) {
            showCard = false;
        }
        
        // Rating filter
        if (selectedRating && rating < parseFloat(selectedRating)) {
            showCard = false;
        }
        
        // Show/hide card with animation
        if (showCard) {
            card.style.display = 'block';
            card.classList.add('fade-in-up');
        } else {
            card.style.display = 'none';
            card.classList.remove('fade-in-up');
        }
    });
    
    // Show "no results" message if no cards are visible
    const visibleCards = document.querySelectorAll('.movie-card[style*="block"]');
    const noResultsMsg = document.getElementById('no-results-message');
    
    if (visibleCards.length === 0 && !noResultsMsg) {
        const container = document.querySelector('.row');
        const message = document.createElement('div');
        message.id = 'no-results-message';
        message.className = 'col-12 text-center py-5';
        message.innerHTML = `
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h3 class="text-muted">No movies found</h3>
            <p class="text-muted">Try adjusting your search criteria</p>
        `;
        container.appendChild(message);
    } else if (visibleCards.length > 0 && noResultsMsg) {
        noResultsMsg.remove();
    }
}

// Seat selection functionality
class SeatSelector {
    constructor(containerId, bookedSeats, seatPrice, maxSeats = 10) {
        this.container = document.getElementById(containerId);
        this.bookedSeats = bookedSeats || [];
        this.seatPrice = seatPrice;
        this.maxSeats = maxSeats;
        this.selectedSeats = [];
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        this.generateSeatMap();
        this.updateSummary();
    }
    
    generateSeatMap() {
        const rows = 10; // A-J
        const seatsPerRow = 12;
        
        for (let row = 0; row < rows; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row d-flex justify-content-center align-items-center mb-2';
            
            // Row label
            const label = document.createElement('div');
            label.className = 'row-label me-3';
            label.textContent = String.fromCharCode(65 + row);
            rowDiv.appendChild(label);
            
            // Seats
            for (let seat = 1; seat <= seatsPerRow; seat++) {
                if (seat === 7) {
                    // Add aisle gap
                    const gap = document.createElement('div');
                    gap.className = 'seat-gap';
                    rowDiv.appendChild(gap);
                }
                
                const seatNumber = `${String.fromCharCode(65 + row)}${seat}`;
                const seatDiv = document.createElement('div');
                seatDiv.className = 'seat me-1';
                seatDiv.textContent = seat;
                seatDiv.dataset.seatNumber = seatNumber;
                
                if (this.bookedSeats.includes(seatNumber)) {
                    seatDiv.classList.add('booked');
                } else {
                    seatDiv.classList.add('available');
                    seatDiv.addEventListener('click', () => this.toggleSeat(seatNumber, seatDiv));
                }
                
                rowDiv.appendChild(seatDiv);
            }
            
            this.container.appendChild(rowDiv);
        }
    }
    
    toggleSeat(seatNumber, seatElement) {
        if (seatElement.classList.contains('booked')) return;
        
        if (this.selectedSeats.includes(seatNumber)) {
            // Deselect
            this.selectedSeats = this.selectedSeats.filter(s => s !== seatNumber);
            seatElement.classList.remove('selected');
            seatElement.classList.add('available');
        } else {
            // Select
            if (this.selectedSeats.length >= this.maxSeats) {
                showAlert('You can select maximum ' + this.maxSeats + ' seats at a time.', 'warning');
                return;
            }
            
            this.selectedSeats.push(seatNumber);
            seatElement.classList.remove('available');
            seatElement.classList.add('selected');
        }
        
        this.updateSummary();
    }
    
    updateSummary() {
        const selectedSeatsDiv = document.getElementById('selectedSeats');
        const seatCountSpan = document.getElementById('seatCount');
        const totalAmountSpan = document.getElementById('totalAmount');
        const confirmButton = document.getElementById('confirmBooking');
        
        if (this.selectedSeats.length === 0) {
            selectedSeatsDiv.innerHTML = '<p class="text-muted">No seats selected</p>';
            seatCountSpan.textContent = '0';
            totalAmountSpan.textContent = '₹0';
            confirmButton.disabled = true;
        } else {
            const seatTags = this.selectedSeats.map(seat => 
                `<span class="seat-badge">${seat}</span>`
            ).join('');
            selectedSeatsDiv.innerHTML = seatTags;
            
            const totalAmount = this.selectedSeats.length * this.seatPrice;
            seatCountSpan.textContent = this.selectedSeats.length;
            totalAmountSpan.textContent = `₹${totalAmount.toFixed(0)}`;
            confirmButton.disabled = false;
        }
        
        // Update form with selected seats
        this.updateFormSeats();
    }
    
    updateFormSeats() {
        const form = document.getElementById('bookingForm');
        if (!form) return;
        
        // Remove existing seat inputs
        const existingInputs = form.querySelectorAll('input[name="seats"]');
        existingInputs.forEach(input => input.remove());
        
        // Add new seat inputs
        this.selectedSeats.forEach(seat => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'seats';
            input.value = seat;
            form.appendChild(input);
        });
    }
}

// Utility functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container, .container-fluid');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        }, 5000);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Admin dashboard functions
function refreshDashboard() {
    location.reload();
}

function exportData(type) {
    showAlert('Export functionality will be implemented in the next version.', 'info');
}

// Booking confirmation
function confirmBooking(bookingId) {
    showAlert(`Booking #${bookingId} confirmed successfully!`, 'success');
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showAlert('An unexpected error occurred. Please try again.', 'danger');
});

// Service worker registration removed to prevent 404 errors
// Will be added in future PWA implementation