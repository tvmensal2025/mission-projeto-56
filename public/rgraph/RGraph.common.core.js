// RGraph Core Functions - Simplified Version
window.RGraph = window.RGraph || {};

window.RGraph.Line = function(opt) {
    this.id = opt.id;
    this.canvas = document.getElementById(this.id) || opt.id;
    this.context = this.canvas.getContext('2d');
    this.data = opt.data || [];
    this.options = opt.options || {};
    
    this.draw = function() {
        const ctx = this.context;
        const canvas = this.canvas;
        const data = this.data;
        const opts = this.options;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up dimensions
        const marginLeft = opts.marginLeft || 40;
        const marginRight = opts.marginRight || 20;
        const marginTop = opts.marginTop || 40;
        const marginBottom = opts.marginBottom || 60;
        
        const chartWidth = canvas.width - marginLeft - marginRight;
        const chartHeight = canvas.height - marginTop - marginBottom;
        
        // Draw title
        if (opts.title) {
            ctx.fillStyle = opts.titleColor || '#333';
            ctx.font = `${opts.titleSize || 14}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(opts.title, canvas.width / 2, 20);
        }
        
        // Find min/max values
        const minValue = Math.min(...data);
        const maxValue = Math.max(...data);
        const valueRange = maxValue - minValue || 1;
        
        // Draw grid
        if (opts.backgroundGridColor) {
            ctx.strokeStyle = opts.backgroundGridColor;
            ctx.lineWidth = 1;
            
            // Horizontal grid lines
            for (let i = 0; i <= 5; i++) {
                const y = marginTop + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(marginLeft, y);
                ctx.lineTo(marginLeft + chartWidth, y);
                ctx.stroke();
                
                // Y-axis labels
                const value = maxValue - (valueRange / 5) * i;
                ctx.fillStyle = '#666';
                ctx.font = `${opts.textSize || 10}px Arial`;
                ctx.textAlign = 'right';
                ctx.fillText(value.toFixed(1), marginLeft - 5, y + 3);
            }
            
            // Vertical grid lines
            for (let i = 0; i <= data.length - 1; i++) {
                const x = marginLeft + (chartWidth / (data.length - 1)) * i;
                ctx.beginPath();
                ctx.moveTo(x, marginTop);
                ctx.lineTo(x, marginTop + chartHeight);
                ctx.stroke();
            }
        }
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(marginLeft, marginTop);
        ctx.lineTo(marginLeft, marginTop + chartHeight);
        ctx.lineTo(marginLeft + chartWidth, marginTop + chartHeight);
        ctx.stroke();
        
        // Draw line
        if (data.length > 1) {
            ctx.strokeStyle = opts.colors ? opts.colors[0] : '#2563eb';
            ctx.lineWidth = opts.linewidth || 2;
            ctx.beginPath();
            
            for (let i = 0; i < data.length; i++) {
                const x = marginLeft + (chartWidth / (data.length - 1)) * i;
                const y = marginTop + chartHeight - ((data[i] - minValue) / valueRange) * chartHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                // Draw points
                if (opts.tickmarksStyle === 'circle') {
                    ctx.fillStyle = opts.tickmarksFill || opts.colors[0] || '#2563eb';
                    ctx.beginPath();
                    ctx.arc(x, y, opts.tickmarksSize || 3, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
            ctx.stroke();
        }
        
        // Draw X-axis labels
        if (opts.xaxisLabels) {
            ctx.fillStyle = '#666';
            ctx.font = `${opts.textSize || 10}px Arial`;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < opts.xaxisLabels.length; i++) {
                const x = marginLeft + (chartWidth / (opts.xaxisLabels.length - 1)) * i;
                const y = marginTop + chartHeight + 20;
                
                ctx.save();
                if (opts.xaxisLabelsAngle) {
                    ctx.translate(x, y);
                    ctx.rotate((opts.xaxisLabelsAngle * Math.PI) / 180);
                    ctx.fillText(opts.xaxisLabels[i], 0, 0);
                } else {
                    ctx.fillText(opts.xaxisLabels[i], x, y);
                }
                ctx.restore();
            }
        }
        
        return this;
    };
};

window.RGraph.Bar = function(opt) {
    this.id = opt.id;
    this.canvas = document.getElementById(this.id) || opt.id;
    this.context = this.canvas.getContext('2d');
    this.data = opt.data || [];
    this.options = opt.options || {};
    
    this.draw = function() {
        const ctx = this.context;
        const canvas = this.canvas;
        const data = this.data;
        const opts = this.options;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up dimensions
        const marginLeft = opts.marginLeft || 40;
        const marginRight = opts.marginRight || 20;
        const marginTop = opts.marginTop || 40;
        const marginBottom = opts.marginBottom || 60;
        
        const chartWidth = canvas.width - marginLeft - marginRight;
        const chartHeight = canvas.height - marginTop - marginBottom;
        
        // Draw title
        if (opts.title) {
            ctx.fillStyle = opts.titleColor || '#333';
            ctx.font = `${opts.titleSize || 14}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(opts.title, canvas.width / 2, 20);
        }
        
        // Find max value
        const maxValue = Math.max(...data);
        
        // Draw grid
        if (opts.backgroundGridColor) {
            ctx.strokeStyle = opts.backgroundGridColor;
            ctx.lineWidth = 1;
            
            // Horizontal grid lines
            for (let i = 0; i <= 5; i++) {
                const y = marginTop + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(marginLeft, y);
                ctx.lineTo(marginLeft + chartWidth, y);
                ctx.stroke();
                
                // Y-axis labels
                const value = maxValue - (maxValue / 5) * i;
                ctx.fillStyle = '#666';
                ctx.font = `${opts.textSize || 10}px Arial`;
                ctx.textAlign = 'right';
                ctx.fillText(value.toFixed(1), marginLeft - 5, y + 3);
            }
        }
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(marginLeft, marginTop);
        ctx.lineTo(marginLeft, marginTop + chartHeight);
        ctx.lineTo(marginLeft + chartWidth, marginTop + chartHeight);
        ctx.stroke();
        
        // Draw bars
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length * 0.2;
        
        for (let i = 0; i < data.length; i++) {
            const barHeight = (data[i] / maxValue) * chartHeight;
            const x = marginLeft + (chartWidth / data.length) * i + barSpacing / 2;
            const y = marginTop + chartHeight - barHeight;
            
            ctx.fillStyle = opts.colors ? opts.colors[0] : '#2563eb';
            ctx.fillRect(x, y, barWidth, barHeight);
        }
        
        // Draw X-axis labels
        if (opts.xaxisLabels) {
            ctx.fillStyle = '#666';
            ctx.font = `${opts.textSize || 10}px Arial`;
            ctx.textAlign = 'center';
            
            for (let i = 0; i < opts.xaxisLabels.length; i++) {
                const x = marginLeft + (chartWidth / opts.xaxisLabels.length) * i + (chartWidth / opts.xaxisLabels.length) / 2;
                const y = marginTop + chartHeight + 20;
                
                ctx.save();
                if (opts.xaxisLabelsAngle) {
                    ctx.translate(x, y);
                    ctx.rotate((opts.xaxisLabelsAngle * Math.PI) / 180);
                    ctx.fillText(opts.xaxisLabels[i], 0, 0);
                } else {
                    ctx.fillText(opts.xaxisLabels[i], x, y);
                }
                ctx.restore();
            }
        }
        
        return this;
    };
};

window.RGraph.Gauge = function(opt) {
    this.id = opt.id;
    this.canvas = document.getElementById(this.id) || opt.id;
    this.context = this.canvas.getContext('2d');
    this.min = opt.min || 0;
    this.max = opt.max || 100;
    this.value = opt.value || 0;
    this.options = opt.options || {};
    
    this.draw = function() {
        const ctx = this.context;
        const canvas = this.canvas;
        const opts = this.options;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2 + 20;
        const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
        
        // Draw title
        if (opts.title) {
            ctx.fillStyle = opts.titleColor || '#333';
            ctx.font = `${opts.titleSize || 14}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(opts.title, centerX, 30);
        }
        
        // Draw gauge background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Draw gauge value
        const percentage = (this.value - this.min) / (this.max - this.min);
        const angle = Math.PI * percentage;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle);
        ctx.strokeStyle = opts.needleColor || '#2563eb';
        ctx.lineWidth = 20;
        ctx.stroke();
        
        // Draw needle
        const needleAngle = Math.PI + angle;
        const needleLength = radius - 10;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(needleAngle) * needleLength,
            centerY + Math.sin(needleAngle) * needleLength
        );
        ctx.strokeStyle = opts.needleColor || '#333';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw center pin
        if (opts.centerpin) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
            ctx.fillStyle = opts.centerpinColor || '#333';
            ctx.fill();
        }
        
        // Draw value text
        ctx.fillStyle = '#333';
        ctx.font = `${opts.textSize || 12}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.value.toFixed(opts.scaleDecimals || 0), centerX, centerY + 30);
        
        return this;
    };
};