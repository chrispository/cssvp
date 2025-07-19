// CSS Animation Viewport - Interactive JavaScript Engine

class CSSAnimationViewport {
    constructor() {
        this.viewportScene = document.querySelector('.viewport-scene');
        this.cssOutput = document.getElementById('cssOutput');
        this.layerList = document.querySelector('.layer-list');

        this.layers = {};
        this.activeLayerId = null;
        this.savedGradients = {
            'Sunset': 'linear-gradient(45deg, #ff6b6b, #feca57)',
            'Ocean': 'linear-gradient(45deg, #48dbfb, #1dd1a1)',
            'Grape': 'linear-gradient(45deg, #5f27cd, #c56cf0)'
        };

        this.animation = {};

        this.init();
    }

    init() {
        this.addLayer('Base Layer', false);
        this.setupEventListeners();
        this.makePanelsDraggable();
        this.updateSavedGradientsUI();
    }

    setupEventListeners() {
        // Transform controls
        document.getElementById('translateX').addEventListener('input', (e) => this.updateTransform('translateX', e.target.value));
        document.getElementById('translateY').addEventListener('input', (e) => this.updateTransform('translateY', e.target.value));
        document.getElementById('translateZ').addEventListener('input', (e) => this.updateTransform('translateZ', e.target.value));

        document.getElementById('scaleX').addEventListener('input', (e) => this.updateTransform('scaleX', e.target.value));
        document.getElementById('scaleY').addEventListener('input', (e) => this.updateTransform('scaleY', e.target.value));
        document.getElementById('scaleZ').addEventListener('input', (e) => this.updateTransform('scaleZ', e.target.value));

        document.getElementById('rotateX').addEventListener('input', (e) => this.updateTransform('rotateX', e.target.value));
        document.getElementById('rotateY').addEventListener('input', (e) => this.updateTransform('rotateY', e.target.value));
        document.getElementById('rotateZ').addEventListener('input', (e) => this.updateTransform('rotateZ', e.target.value));

        // Transform value inputs
        document.getElementById('translateXValue').addEventListener('input', (e) => this.updateTransform('translateX', e.target.value));
        document.getElementById('translateYValue').addEventListener('input', (e) => this.updateTransform('translateY', e.target.value));
        document.getElementById('translateZValue').addEventListener('input', (e) => this.updateTransform('translateZ', e.target.value));

        document.getElementById('scaleXValue').addEventListener('input', (e) => this.updateTransform('scaleX', e.target.value));
        document.getElementById('scaleYValue').addEventListener('input', (e) => this.updateTransform('scaleY', e.target.value));
        document.getElementById('scaleZValue').addEventListener('input', (e) => this.updateTransform('scaleZ', e.target.value));

        document.getElementById('rotateXValue').addEventListener('input', (e) => this.updateTransform('rotateX', e.target.value));
        document.getElementById('rotateYValue').addEventListener('input', (e) => this.updateTransform('rotateY', e.target.value));
        document.getElementById('rotateZValue').addEventListener('input', (e) => this.updateTransform('rotateZ', e.target.value));

        // Animation controls
        document.getElementById('duration').addEventListener('input', (e) => this.updateAnimation('duration', e.target.value));
        document.getElementById('delay').addEventListener('input', (e) => this.updateAnimation('delay', e.target.value));
        document.getElementById('iterationCount').addEventListener('change', (e) => this.updateAnimation('iterationCount', e.target.value));
        document.getElementById('direction').addEventListener('change', (e) => this.updateAnimation('direction', e.target.value));
        document.getElementById('timingFunction').addEventListener('change', (e) => this.updateAnimation('timingFunction', e.target.value));

        // Gradient controls
        document.getElementById('gradientType').addEventListener('change', () => this.updateGradient());
        document.getElementById('colorStopsContainer').addEventListener('input', e => {
            const target = e.target;
            const stopElement = target.closest('.color-stop');
            if (!stopElement) return;

            const index = parseInt(stopElement.dataset.index, 10);
            const property = target.dataset.property; // 'color', 'position', 'alpha'

            if (property) {
                this.updateGradientStop(index, property, target.value);
            }
        });
        document.getElementById('colorStopsContainer').addEventListener('click', e => {
            if (e.target.classList.contains('remove-stop-btn')) {
                const stopElement = e.target.closest('.color-stop');
                const index = parseInt(stopElement.dataset.index, 10);
                this.removeGradientStop(index);
            }
        });

        document.getElementById('addColorStop').addEventListener('click', () => this.addGradientStop());
        document.getElementById('saveGradient').addEventListener('click', () => this.saveGradient());
        document.getElementById('savedGradients').addEventListener('change', (e) => this.applySavedGradient(e.target.value));


        // Layer Properties
        document.getElementById('opacity').addEventListener('input', (e) => this.updateLayerProperty('opacity', e.target.value));
        document.getElementById('shadowEnabled').addEventListener('change', (e) => this.updateShadow('enabled', e.target.checked));
        document.getElementById('shadowColor').addEventListener('input', (e) => this.updateShadow('color', e.target.value));
        document.getElementById('shadowX').addEventListener('input', (e) => this.updateShadow('x', e.target.value));
        document.getElementById('shadowY').addEventListener('input', (e) => this.updateShadow('y', e.target.value));
        document.getElementById('shadowBlur').addEventListener('input', (e) => this.updateShadow('blur', e.target.value));

        // Animation buttons
        document.getElementById('playAnimation').addEventListener('click', () => this.playAnimation());
        document.getElementById('pauseAnimation').addEventListener('click', () => this.pauseAnimation());
        document.getElementById('resetAnimation').addEventListener('click', () => this.resetAnimation());

        // Copy CSS
        document.getElementById('copyCSS').addEventListener('click', () => this.copyCSS());

        // Layer management
        document.getElementById('addLayer').addEventListener('click', () => this.addLayer());

        // Panel close buttons
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.floating-panel').style.display = 'none';
            });
        });
    }

    updateTransform(property, value) {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        const parsedValue = parseFloat(value);

        if (isNaN(parsedValue)) return;

        layer.transforms[property] = parsedValue;
        this.updateElement(layer);
        this.updateCSS();

        // Sync the corresponding input elements
        const rangeInput = document.getElementById(property);
        const valueInput = document.getElementById(`${property}Value`);

        if (rangeInput.value !== value) {
            rangeInput.value = value;
        }
        if (valueInput.value !== value) {
            valueInput.value = value;
        }
    }

    updateAnimation(property, value) {
        this.animation[property] = value;
        this.updateCSS();

        const displayElement = document.getElementById(`${property}Value`);
        if (displayElement) {
            displayElement.textContent = value;
        }
    }

    // --- Gradient Management ---

    updateGradient() {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        layer.gradient.type = document.getElementById('gradientType').value;
        // Angle control could be added here in the future
        this.updateElement(layer);
        this.updateCSS();
    }

    updateGradientStop(index, property, value) {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        const stop = layer.gradient.stops[index];

        if (stop) {
            stop[property] = value;
            this.updateElement(layer);
            this.updateCSS();
        }
    }

    addGradientStop() {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        const stops = layer.gradient.stops;

        // Add new stop at a reasonable position
        const lastStop = stops[stops.length - 1];
        const newPosition = Math.min(100, lastStop.position + 10);

        stops.push({
            color: '#ffffff',
            alpha: 1,
            position: newPosition
        });

        // Re-sort stops by position
        stops.sort((a, b) => a.position - b.position);

        this.renderColorStopsUI(stops);
        this.updateElement(layer);
        this.updateCSS();
    }

    removeGradientStop(index) {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        const stops = layer.gradient.stops;

        if (stops.length <= 2) {
            alert('A gradient must have at least two color stops.');
            return;
        }

        stops.splice(index, 1);
        this.renderColorStopsUI(stops);
        this.updateElement(layer);
        this.updateCSS();
    }

    renderColorStopsUI(stops) {
        const container = document.getElementById('colorStopsContainer');
        container.innerHTML = ''; // Clear existing stops

        stops.forEach((stop, index) => {
            const stopElement = document.createElement('div');
            stopElement.className = 'color-stop';
            stopElement.dataset.index = index;

            stopElement.innerHTML = `
                <input type="color" data-property="color" value="${stop.color}">
                <div class="alpha-control">
                    <label>Alpha: ${stop.alpha}</label>
                    <input type="range" data-property="alpha" min="0" max="1" step="0.01" value="${stop.alpha}">
                </div>
                <div class="alpha-control">
                    <label>Pos: ${stop.position}%</label>
                    <input type="range" data-property="position" min="0" max="100" value="${stop.position}">
                </div>
                <button class="remove-stop-btn" title="Remove color stop">×</button>
            `;
            container.appendChild(stopElement);
        });
    }

    generateGradientString(gradient) {
        const colorStopsString = gradient.stops
            .map(stop => {
                const rgba = this.hexToRgba(stop.color, stop.alpha);
                return `${rgba} ${stop.position}%`;
            })
            .join(', ');

        if (gradient.type === 'linear') {
            return `linear-gradient(45deg, ${colorStopsString})`;
        } else { // radial
            return `radial-gradient(circle, ${colorStopsString})`;
        }
    }

    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // --- End Gradient Management ---

    updateLayerProperty(property, value) {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        layer[property] = value;
        this.updateElement(layer);
        this.updateCSS();
        const displayElement = document.getElementById(`${property}Value`);
        if (displayElement) {
            displayElement.textContent = value;
        }
    }

    updateShadow(property, value) {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        layer.shadow[property] = value;
        this.updateElement(layer);
        this.updateCSS();
    }


    updateElement(layer) {
        const transform = `
            translate3d(${layer.transforms.translateX}px, ${layer.transforms.translateY}px, ${layer.transforms.translateZ}px)
            scale3d(${layer.transforms.scaleX}, ${layer.transforms.scaleY}, ${layer.transforms.scaleZ})
            rotateX(${layer.transforms.rotateX}deg)
            rotateY(${layer.transforms.rotateY}deg)
            rotateZ(${layer.transforms.rotateZ}deg)
        `;
        layer.element.style.transform = transform;

        const gradient = this.generateGradientString(layer.gradient);
        layer.element.style.background = gradient;

        layer.element.style.opacity = layer.opacity;
        if (layer.shadow.enabled) {
            layer.element.style.boxShadow = `${layer.shadow.x}px ${layer.shadow.y}px ${layer.shadow.blur}px ${layer.shadow.color}`;
        } else {
            layer.element.style.boxShadow = 'none';
        }
    }

    updateCSS() {
        let css = '/* CSS Animation Generated by CSS Animation Viewport */\n';
        for (const layerId in this.layers) {
            const layer = this.layers[layerId];
            const gradientString = this.generateGradientString(layer.gradient);
            css += `\n#${layer.id} {\n    width: 200px;\n    height: 200px;\n    position: absolute;\n    background: ${gradientString};\n    border-radius: 8px;\n    opacity: ${layer.opacity};\n    box-shadow: ${layer.shadow.enabled ? `${layer.shadow.x}px ${layer.shadow.y}px ${layer.shadow.blur}px ${layer.shadow.color}` : 'none'};\n    transform: translate3d(${layer.transforms.translateX}px, ${layer.transforms.translateY}px, ${layer.transforms.translateZ}px)\n               scale3d(${layer.transforms.scaleX}, ${layer.transforms.scaleY}, ${layer.transforms.scaleZ})\n               rotateX(${layer.transforms.rotateX}deg)\n               rotateY(${layer.transforms.rotateY}deg)\n               rotateZ(${layer.transforms.rotateZ}deg);\n    transition: transform ${this.animation.duration || 0}s ${this.animation.timingFunction || 'ease'} ${this.animation.delay || 0}s;\n    animation: ${layer.id}-animation ${this.animation.duration || 0}s ${this.animation.timingFunction || 'ease'} ${this.animation.delay || 0}s ${this.animation.iterationCount || 1} ${this.animation.direction || 'normal'};\n}\n\n@keyframes ${layer.id}-animation {\n    from {\n        transform: translate3d(0,0,0) scale3d(1,1,1) rotateX(0) rotateY(0) rotateZ(0);\n    }\n    to {\n        transform: translate3d(${layer.transforms.translateX}px, ${layer.transforms.translateY}px, ${layer.transforms.translateZ}px)\n                   scale3d(${layer.transforms.scaleX}, ${layer.transforms.scaleY}, ${layer.transforms.scaleZ})\n                   rotateX(${layer.transforms.rotateX}deg)\n                   rotateY(${layer.transforms.rotateY}deg)\n                   rotateZ(${layer.transforms.rotateZ}deg);\n    }\n}\n        `.trim() + '\n\n';
        }
        this.cssOutput.value = css;
    }

    addLayer(name, isPrompt = true) {
        const layerName = isPrompt ? prompt('Enter layer name:') : name;
        if (layerName) {
            const id = `layer-${Date.now()}`;
            const newElement = document.createElement('div');
            newElement.className = 'animated-rectangle';
            newElement.id = id;
            this.viewportScene.appendChild(newElement);

            const numLayers = Object.keys(this.layers).length;

            this.layers[id] = {
                id: id,
                name: layerName,
                element: newElement,
                visible: true,
                opacity: 1,
                shadow: {
                    enabled: false,
                    color: '#000000',
                    x: 0,
                    y: 0,
                    blur: 10
                },
                transforms: {
                    translateX: 10 * numLayers,
                    translateY: 10 * numLayers,
                    translateZ: 0,
                    scaleX: 1,
                    scaleY: 1,
                    scaleZ: 1,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0
                },
                gradient: {
                    type: 'linear',
                    angle: 45,
                    stops: [
                        { color: '#3498db', alpha: 1, position: 0 },
                        { color: '#e74c3c', alpha: 1, position: 100 }
                    ]
                }
            };

            this.updateElement(this.layers[id]);
            this.addLayerToUI(id, layerName);
            this.setActiveLayer(id);
            this.updateCSS();
        }
    }

    addLayerToUI(id, name) {
        const layerItem = document.createElement('div');
        layerItem.className = 'layer-item';
        layerItem.dataset.layer = id;
        layerItem.innerHTML = `\n            <span>${name}</span>\n            <div class="layer-controls">\n                <button class="visibility-btn">👁</button>\n                <button class="delete-btn">×</button>\n            </div>\n        `;
        this.layerList.appendChild(layerItem);

        layerItem.addEventListener('click', () => this.setActiveLayer(id));
        layerItem.querySelector('.visibility-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLayerVisibility(id);
        });
        layerItem.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteLayer(id);
        });
    }

    setActiveLayer(id) {
        if (this.activeLayerId) {
            document.querySelector(`[data-layer="${this.activeLayerId}"]`).classList.remove('active');
        }
        this.activeLayerId = id;
        document.querySelector(`[data-layer="${id}"]`).classList.add('active');
        this.updateControlsToLayer(this.layers[id]);
    }

    updateControlsToLayer(layer) {
        for (const prop in layer.transforms) {
            const input = document.getElementById(prop);
            if (input) input.value = layer.transforms[prop];
            const valueInput = document.getElementById(`${prop}Value`);
            if (valueInput) {
                valueInput.value = layer.transforms[prop];
            }
        }
        document.getElementById('gradientType').value = layer.gradient.type;
        this.renderColorStopsUI(layer.gradient.stops);

        document.getElementById('opacity').value = layer.opacity;
        document.getElementById('opacityValue').textContent = layer.opacity;

        document.getElementById('shadowEnabled').checked = layer.shadow.enabled;
        document.getElementById('shadowColor').value = layer.shadow.color;
        document.getElementById('shadowX').value = layer.shadow.x;
        document.getElementById('shadowY').value = layer.shadow.y;
        document.getElementById('shadowBlur').value = layer.shadow.blur;
    }

    toggleLayerVisibility(id) {
        const layer = this.layers[id];
        layer.visible = !layer.visible;
        layer.element.style.display = layer.visible ? '' : 'none';
        const btn = document.querySelector(`[data-layer="${id}"] .visibility-btn`);
        btn.textContent = layer.visible ? '👁' : '👁‍🗨';
    }

    deleteLayer(id) {
        if (Object.keys(this.layers).length <= 1) {
            alert('Cannot delete the last layer.');
            return;
        }
        const layer = this.layers[id];
        layer.element.remove();
        document.querySelector(`[data-layer="${id}"]`).remove();
        delete this.layers[id];

        if (this.activeLayerId === id) {
            this.activeLayerId = null;
            const remainingLayerIds = Object.keys(this.layers);
            if (remainingLayerIds.length > 0) {
                this.setActiveLayer(remainingLayerIds[0]);
            }
        }
        this.updateCSS();
    }

    playAnimation() {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        layer.element.style.animation = 'none';
        void layer.element.offsetWidth; // Trigger reflow
        layer.element.style.animation = `${layer.id}-animation ${this.animation.duration}s ${this.animation.timingFunction} ${this.animation.delay}s ${this.animation.iterationCount} ${this.animation.direction}`;
    }

    pauseAnimation() {
        if (!this.activeLayerId) return;
        this.layers[this.activeLayerId].element.style.animationPlayState = 'paused';
    }

    resetAnimation() {
        if (!this.activeLayerId) return;
        const layer = this.layers[this.activeLayerId];
        layer.element.style.animation = 'none';
        
        layer.transforms = {
            translateX: 0, translateY: 0, translateZ: 0,
            scaleX: 1, scaleY: 1, scaleZ: 1,
            rotateX: 0, rotateY: 0, rotateZ: 0
        };
        this.updateElement(layer);
        this.updateControlsToLayer(layer);
        this.updateCSS();
    }

    copyCSS() {
        this.cssOutput.select();
        document.execCommand('copy');
        const button = document.getElementById('copyCSS');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 1500);
    }

    makePanelsDraggable() {
        const panels = document.querySelectorAll('.floating-panel');
        panels.forEach(panel => {
            const header = panel.querySelector('.panel-header');
            let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

            header.addEventListener('mousedown', e => {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                if (e.target === header || header.contains(e.target)) isDragging = true;
            });
            document.addEventListener('mousemove', e => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    panel.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
            });
            document.addEventListener('mouseup', () => isDragging = false);
        });
    }

    saveGradient() {
        const name = prompt('Enter a name for the gradient:');
        if (name && this.activeLayerId) {
            const layer = this.layers[this.activeLayerId];
            const gradientString = this.generateGradientString(layer.gradient);
            this.savedGradients[name] = gradientString;
            this.updateSavedGradientsUI();
        }
    }

    updateSavedGradientsUI() {
        const select = document.getElementById('savedGradients');
        select.innerHTML = '';
        for (const name in this.savedGradients) {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        }
    }

    applySavedGradient(name) {
        if (!this.activeLayerId || !this.savedGradients[name]) return;
        const layer = this.layers[this.activeLayerId];
        const gradient = this.savedGradients[name];
        layer.element.style.background = gradient;
        // This is a simplified approach. A more robust solution would parse the gradient string
        // and update the layer.gradient object. For now, we just apply the style directly.
        this.updateCSS();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cssViewport = new CSSAnimationViewport();
});

