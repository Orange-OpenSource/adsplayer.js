//COPYRIGHT/* Last build : @@TIMESTAMP / git revision : @@REVISION */
/* jshint ignore:start */
(function() {
    "use strict";
    var root = this, previous = root.Chart;
    var Chart = function(context) {
        var chart = this;
        this.canvas = context.canvas;
        this.ctx = context;
        var computeDimension = function(element, dimension) {
            if (element["offset" + dimension]) {
                return element["offset" + dimension];
            } else {
                return document.defaultView.getComputedStyle(element).getPropertyValue(dimension);
            }
        };
        var width = this.width = computeDimension(context.canvas, "Width");
        var height = this.height = computeDimension(context.canvas, "Height");
        context.canvas.width = width;
        context.canvas.height = height;
        var width = this.width = context.canvas.width;
        var height = this.height = context.canvas.height;
        this.aspectRatio = this.width / this.height;
        helpers.retinaScale(this);
        return this;
    };
    Chart.defaults = {
        global: {
            animation: true,
            animationSteps: 60,
            animationEasing: "easeOutQuart",
            showScale: true,
            scaleOverride: false,
            scaleSteps: null,
            scaleStepWidth: null,
            scaleStartValue: null,
            scaleLineColor: "rgba(0,0,0,.1)",
            scaleLineWidth: 1,
            scaleShowLabels: true,
            scaleLabel: "<%=value%>",
            scaleIntegersOnly: true,
            scaleBeginAtZero: false,
            scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            scaleFontSize: 12,
            scaleFontStyle: "normal",
            scaleFontColor: "#666",
            responsive: false,
            maintainAspectRatio: true,
            showTooltips: true,
            customTooltips: false,
            tooltipEvents: [ "mousemove", "touchstart", "touchmove", "mouseout" ],
            tooltipFillColor: "rgba(0,0,0,0.8)",
            tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipFontSize: 14,
            tooltipFontStyle: "normal",
            tooltipFontColor: "#fff",
            tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
            tooltipTitleFontSize: 14,
            tooltipTitleFontStyle: "bold",
            tooltipTitleFontColor: "#fff",
            tooltipYPadding: 6,
            tooltipXPadding: 6,
            tooltipCaretSize: 8,
            tooltipCornerRadius: 6,
            tooltipXOffset: 10,
            tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
            multiTooltipTemplate: "<%= value %>",
            multiTooltipKeyBackground: "#fff",
            onAnimationProgress: function() {},
            onAnimationComplete: function() {}
        }
    };
    Chart.types = {};
    var helpers = Chart.helpers = {};
    var each = helpers.each = function(loopable, callback, self) {
        var additionalArgs = Array.prototype.slice.call(arguments, 3);
        if (loopable) {
            if (loopable.length === +loopable.length) {
                var i;
                for (i = 0; i < loopable.length; i++) {
                    callback.apply(self, [ loopable[i], i ].concat(additionalArgs));
                }
            } else {
                for (var item in loopable) {
                    callback.apply(self, [ loopable[item], item ].concat(additionalArgs));
                }
            }
        }
    }, clone = helpers.clone = function(obj) {
        var objClone = {};
        each(obj, function(value, key) {
            if (obj.hasOwnProperty(key)) objClone[key] = value;
        });
        return objClone;
    }, extend = helpers.extend = function(base) {
        each(Array.prototype.slice.call(arguments, 1), function(extensionObject) {
            each(extensionObject, function(value, key) {
                if (extensionObject.hasOwnProperty(key)) base[key] = value;
            });
        });
        return base;
    }, merge = helpers.merge = function(base, master) {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift({});
        return extend.apply(null, args);
    }, indexOf = helpers.indexOf = function(arrayToSearch, item) {
        if (Array.prototype.indexOf) {
            return arrayToSearch.indexOf(item);
        } else {
            for (var i = 0; i < arrayToSearch.length; i++) {
                if (arrayToSearch[i] === item) return i;
            }
            return -1;
        }
    }, where = helpers.where = function(collection, filterCallback) {
        var filtered = [];
        helpers.each(collection, function(item) {
            if (filterCallback(item)) {
                filtered.push(item);
            }
        });
        return filtered;
    }, findNextWhere = helpers.findNextWhere = function(arrayToSearch, filterCallback, startIndex) {
        if (!startIndex) {
            startIndex = -1;
        }
        for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
            var currentItem = arrayToSearch[i];
            if (filterCallback(currentItem)) {
                return currentItem;
            }
        }
    }, findPreviousWhere = helpers.findPreviousWhere = function(arrayToSearch, filterCallback, startIndex) {
        if (!startIndex) {
            startIndex = arrayToSearch.length;
        }
        for (var i = startIndex - 1; i >= 0; i--) {
            var currentItem = arrayToSearch[i];
            if (filterCallback(currentItem)) {
                return currentItem;
            }
        }
    }, inherits = helpers.inherits = function(extensions) {
        var parent = this;
        var ChartElement = extensions && extensions.hasOwnProperty("constructor") ? extensions.constructor : function() {
            return parent.apply(this, arguments);
        };
        var Surrogate = function() {
            this.constructor = ChartElement;
        };
        Surrogate.prototype = parent.prototype;
        ChartElement.prototype = new Surrogate();
        ChartElement.extend = inherits;
        if (extensions) extend(ChartElement.prototype, extensions);
        ChartElement.__super__ = parent.prototype;
        return ChartElement;
    }, noop = helpers.noop = function() {}, uid = helpers.uid = function() {
        var id = 0;
        return function() {
            return "chart-" + id++;
        };
    }(), warn = helpers.warn = function(str) {
        if (window.console && typeof window.console.warn == "function") console.warn(str);
    }, amd = helpers.amd = typeof define == "function" && define.amd, isNumber = helpers.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }, max = helpers.max = function(array) {
        return Math.max.apply(Math, array);
    }, min = helpers.min = function(array) {
        return Math.min.apply(Math, array);
    }, cap = helpers.cap = function(valueToCap, maxValue, minValue) {
        if (isNumber(maxValue)) {
            if (valueToCap > maxValue) {
                return maxValue;
            }
        } else if (isNumber(minValue)) {
            if (valueToCap < minValue) {
                return minValue;
            }
        }
        return valueToCap;
    }, getDecimalPlaces = helpers.getDecimalPlaces = function(num) {
        if (num % 1 !== 0 && isNumber(num)) {
            return num.toString().split(".")[1].length;
        } else {
            return 0;
        }
    }, toRadians = helpers.radians = function(degrees) {
        return degrees * (Math.PI / 180);
    }, getAngleFromPoint = helpers.getAngleFromPoint = function(centrePoint, anglePoint) {
        var distanceFromXCenter = anglePoint.x - centrePoint.x, distanceFromYCenter = anglePoint.y - centrePoint.y, radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
        var angle = Math.PI * 2 + Math.atan2(distanceFromYCenter, distanceFromXCenter);
        if (distanceFromXCenter < 0 && distanceFromYCenter < 0) {
            angle += Math.PI * 2;
        }
        return {
            angle: angle,
            distance: radialDistanceFromCenter
        };
    }, aliasPixel = helpers.aliasPixel = function(pixelWidth) {
        return pixelWidth % 2 === 0 ? 0 : .5;
    }, splineCurve = helpers.splineCurve = function(FirstPoint, MiddlePoint, AfterPoint, t) {
        var d01 = Math.sqrt(Math.pow(MiddlePoint.x - FirstPoint.x, 2) + Math.pow(MiddlePoint.y - FirstPoint.y, 2)), d12 = Math.sqrt(Math.pow(AfterPoint.x - MiddlePoint.x, 2) + Math.pow(AfterPoint.y - MiddlePoint.y, 2)), fa = t * d01 / (d01 + d12), fb = t * d12 / (d01 + d12);
        return {
            inner: {
                x: MiddlePoint.x - fa * (AfterPoint.x - FirstPoint.x),
                y: MiddlePoint.y - fa * (AfterPoint.y - FirstPoint.y)
            },
            outer: {
                x: MiddlePoint.x + fb * (AfterPoint.x - FirstPoint.x),
                y: MiddlePoint.y + fb * (AfterPoint.y - FirstPoint.y)
            }
        };
    }, calculateOrderOfMagnitude = helpers.calculateOrderOfMagnitude = function(val) {
        return Math.floor(Math.log(val) / Math.LN10);
    }, calculateScaleRange = helpers.calculateScaleRange = function(valuesArray, drawingSize, textSize, startFromZero, integersOnly) {
        var minSteps = 2, maxSteps = Math.floor(drawingSize / (textSize * 1.5)), skipFitting = minSteps >= maxSteps;
        var maxValue = max(valuesArray), minValue = min(valuesArray);
        if (maxValue === minValue) {
            maxValue += .5;
            if (minValue >= .5 && !startFromZero) {
                minValue -= .5;
            } else {
                maxValue += .5;
            }
        }
        var valueRange = Math.abs(maxValue - minValue), rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange), graphMax = Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude), graphMin = startFromZero ? 0 : Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) * Math.pow(10, rangeOrderOfMagnitude), graphRange = graphMax - graphMin, stepValue = Math.pow(10, rangeOrderOfMagnitude), numberOfSteps = Math.round(graphRange / stepValue);
        while ((numberOfSteps > maxSteps || numberOfSteps * 2 < maxSteps) && !skipFitting) {
            if (numberOfSteps > maxSteps) {
                stepValue *= 2;
                numberOfSteps = Math.round(graphRange / stepValue);
                if (numberOfSteps % 1 !== 0) {
                    skipFitting = true;
                }
            } else {
                if (integersOnly && rangeOrderOfMagnitude >= 0) {
                    if (stepValue / 2 % 1 === 0) {
                        stepValue /= 2;
                        numberOfSteps = Math.round(graphRange / stepValue);
                    } else {
                        break;
                    }
                } else {
                    stepValue /= 2;
                    numberOfSteps = Math.round(graphRange / stepValue);
                }
            }
        }
        if (skipFitting) {
            numberOfSteps = minSteps;
            stepValue = graphRange / numberOfSteps;
        }
        return {
            steps: numberOfSteps,
            stepValue: stepValue,
            min: graphMin,
            max: graphMin + numberOfSteps * stepValue
        };
    }, template = helpers.template = function(templateString, valuesObject) {
        if (templateString instanceof Function) {
            return templateString(valuesObject);
        }
        var cache = {};
        function tmpl(str, data) {
            var fn = !/\W/.test(str) ? cache[str] = cache[str] : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("	").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("	").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
            return data ? fn(data) : fn;
        }
        return tmpl(templateString, valuesObject);
    }, generateLabels = helpers.generateLabels = function(templateString, numberOfSteps, graphMin, stepValue) {
        var labelsArray = new Array(numberOfSteps);
        if (labelTemplateString) {
            each(labelsArray, function(val, index) {
                labelsArray[index] = template(templateString, {
                    value: graphMin + stepValue * (index + 1)
                });
            });
        }
        return labelsArray;
    }, easingEffects = helpers.easingEffects = {
        linear: function(t) {
            return t;
        },
        easeInQuad: function(t) {
            return t * t;
        },
        easeOutQuad: function(t) {
            return -1 * t * (t - 2);
        },
        easeInOutQuad: function(t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t;
            return -1 / 2 * (--t * (t - 2) - 1);
        },
        easeInCubic: function(t) {
            return t * t * t;
        },
        easeOutCubic: function(t) {
            return 1 * ((t = t / 1 - 1) * t * t + 1);
        },
        easeInOutCubic: function(t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t + 2);
        },
        easeInQuart: function(t) {
            return t * t * t * t;
        },
        easeOutQuart: function(t) {
            return -1 * ((t = t / 1 - 1) * t * t * t - 1);
        },
        easeInOutQuart: function(t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t;
            return -1 / 2 * ((t -= 2) * t * t * t - 2);
        },
        easeInQuint: function(t) {
            return 1 * (t /= 1) * t * t * t * t;
        },
        easeOutQuint: function(t) {
            return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
        },
        easeInOutQuint: function(t) {
            if ((t /= 1 / 2) < 1) return 1 / 2 * t * t * t * t * t;
            return 1 / 2 * ((t -= 2) * t * t * t * t + 2);
        },
        easeInSine: function(t) {
            return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1;
        },
        easeOutSine: function(t) {
            return 1 * Math.sin(t / 1 * (Math.PI / 2));
        },
        easeInOutSine: function(t) {
            return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1);
        },
        easeInExpo: function(t) {
            return t === 0 ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
        },
        easeOutExpo: function(t) {
            return t === 1 ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1);
        },
        easeInOutExpo: function(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if ((t /= 1 / 2) < 1) return 1 / 2 * Math.pow(2, 10 * (t - 1));
            return 1 / 2 * (-Math.pow(2, -10 * --t) + 2);
        },
        easeInCirc: function(t) {
            if (t >= 1) return t;
            return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
        },
        easeOutCirc: function(t) {
            return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
        },
        easeInOutCirc: function(t) {
            if ((t /= 1 / 2) < 1) return -1 / 2 * (Math.sqrt(1 - t * t) - 1);
            return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1);
        },
        easeInElastic: function(t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0) return 0;
            if ((t /= 1) == 1) return 1;
            if (!p) p = 1 * .3;
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
        },
        easeOutElastic: function(t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0) return 0;
            if ((t /= 1) == 1) return 1;
            if (!p) p = 1 * .3;
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1;
        },
        easeInOutElastic: function(t) {
            var s = 1.70158;
            var p = 0;
            var a = 1;
            if (t === 0) return 0;
            if ((t /= 1 / 2) == 2) return 1;
            if (!p) p = 1 * (.3 * 1.5);
            if (a < Math.abs(1)) {
                a = 1;
                s = p / 4;
            } else s = p / (2 * Math.PI) * Math.asin(1 / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p));
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * .5 + 1;
        },
        easeInBack: function(t) {
            var s = 1.70158;
            return 1 * (t /= 1) * t * ((s + 1) * t - s);
        },
        easeOutBack: function(t) {
            var s = 1.70158;
            return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
        },
        easeInOutBack: function(t) {
            var s = 1.70158;
            if ((t /= 1 / 2) < 1) return 1 / 2 * (t * t * (((s *= 1.525) + 1) * t - s));
            return 1 / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
        },
        easeInBounce: function(t) {
            return 1 - easingEffects.easeOutBounce(1 - t);
        },
        easeOutBounce: function(t) {
            if ((t /= 1) < 1 / 2.75) {
                return 1 * (7.5625 * t * t);
            } else if (t < 2 / 2.75) {
                return 1 * (7.5625 * (t -= 1.5 / 2.75) * t + .75);
            } else if (t < 2.5 / 2.75) {
                return 1 * (7.5625 * (t -= 2.25 / 2.75) * t + .9375);
            } else {
                return 1 * (7.5625 * (t -= 2.625 / 2.75) * t + .984375);
            }
        },
        easeInOutBounce: function(t) {
            if (t < 1 / 2) return easingEffects.easeInBounce(t * 2) * .5;
            return easingEffects.easeOutBounce(t * 2 - 1) * .5 + 1 * .5;
        }
    }, requestAnimFrame = helpers.requestAnimFrame = function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
            return window.setTimeout(callback, 1e3 / 60);
        };
    }(), cancelAnimFrame = helpers.cancelAnimFrame = function() {
        return window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || function(callback) {
            return window.clearTimeout(callback, 1e3 / 60);
        };
    }(), animationLoop = helpers.animationLoop = function(callback, totalSteps, easingString, onProgress, onComplete, chartInstance) {
        var currentStep = 0, easingFunction = easingEffects[easingString] || easingEffects.linear;
        var animationFrame = function() {
            currentStep++;
            var stepDecimal = currentStep / totalSteps;
            var easeDecimal = easingFunction(stepDecimal);
            callback.call(chartInstance, easeDecimal, stepDecimal, currentStep);
            onProgress.call(chartInstance, easeDecimal, stepDecimal);
            if (currentStep < totalSteps) {
                chartInstance.animationFrame = requestAnimFrame(animationFrame);
            } else {
                onComplete.apply(chartInstance);
            }
        };
        requestAnimFrame(animationFrame);
    }, getRelativePosition = helpers.getRelativePosition = function(evt) {
        var mouseX, mouseY;
        var e = evt.originalEvent || evt, canvas = evt.currentTarget || evt.srcElement, boundingRect = canvas.getBoundingClientRect();
        if (e.touches) {
            mouseX = e.touches[0].clientX - boundingRect.left;
            mouseY = e.touches[0].clientY - boundingRect.top;
        } else {
            mouseX = e.clientX - boundingRect.left;
            mouseY = e.clientY - boundingRect.top;
        }
        return {
            x: mouseX,
            y: mouseY
        };
    }, addEvent = helpers.addEvent = function(node, eventType, method) {
        if (node.addEventListener) {
            node.addEventListener(eventType, method);
        } else if (node.attachEvent) {
            node.attachEvent("on" + eventType, method);
        } else {
            node["on" + eventType] = method;
        }
    }, removeEvent = helpers.removeEvent = function(node, eventType, handler) {
        if (node.removeEventListener) {
            node.removeEventListener(eventType, handler, false);
        } else if (node.detachEvent) {
            node.detachEvent("on" + eventType, handler);
        } else {
            node["on" + eventType] = noop;
        }
    }, bindEvents = helpers.bindEvents = function(chartInstance, arrayOfEvents, handler) {
        if (!chartInstance.events) chartInstance.events = {};
        each(arrayOfEvents, function(eventName) {
            chartInstance.events[eventName] = function() {
                handler.apply(chartInstance, arguments);
            };
            addEvent(chartInstance.chart.canvas, eventName, chartInstance.events[eventName]);
        });
    }, unbindEvents = helpers.unbindEvents = function(chartInstance, arrayOfEvents) {
        each(arrayOfEvents, function(handler, eventName) {
            removeEvent(chartInstance.chart.canvas, eventName, handler);
        });
    }, getMaximumWidth = helpers.getMaximumWidth = function(domNode) {
        var container = domNode.parentNode;
        return container.clientWidth;
    }, getMaximumHeight = helpers.getMaximumHeight = function(domNode) {
        var container = domNode.parentNode;
        return container.clientHeight;
    }, getMaximumSize = helpers.getMaximumSize = helpers.getMaximumWidth, retinaScale = helpers.retinaScale = function(chart) {
        var ctx = chart.ctx, width = chart.canvas.width, height = chart.canvas.height;
        if (window.devicePixelRatio) {
            ctx.canvas.style.width = width + "px";
            ctx.canvas.style.height = height + "px";
            ctx.canvas.height = height * window.devicePixelRatio;
            ctx.canvas.width = width * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    }, clear = helpers.clear = function(chart) {
        chart.ctx.clearRect(0, 0, chart.width, chart.height);
    }, fontString = helpers.fontString = function(pixelSize, fontStyle, fontFamily) {
        return fontStyle + " " + pixelSize + "px " + fontFamily;
    }, longestText = helpers.longestText = function(ctx, font, arrayOfStrings) {
        ctx.font = font;
        var longest = 0;
        each(arrayOfStrings, function(string) {
            var textWidth = ctx.measureText(string).width;
            longest = textWidth > longest ? textWidth : longest;
        });
        return longest;
    }, drawRoundedRectangle = helpers.drawRoundedRectangle = function(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    };
    Chart.instances = {};
    Chart.Type = function(data, options, chart) {
        this.options = options;
        this.chart = chart;
        this.id = uid();
        Chart.instances[this.id] = this;
        if (options.responsive) {
            this.resize();
        }
        this.initialize.call(this, data);
    };
    extend(Chart.Type.prototype, {
        initialize: function() {
            return this;
        },
        clear: function() {
            clear(this.chart);
            return this;
        },
        stop: function() {
            cancelAnimFrame(this.animationFrame);
            return this;
        },
        resize: function(callback) {
            this.stop();
            var canvas = this.chart.canvas, newWidth = getMaximumWidth(this.chart.canvas), newHeight = this.options.maintainAspectRatio ? newWidth / this.chart.aspectRatio : getMaximumHeight(this.chart.canvas);
            canvas.width = this.chart.width = newWidth;
            canvas.height = this.chart.height = newHeight;
            retinaScale(this.chart);
            if (typeof callback === "function") {
                callback.apply(this, Array.prototype.slice.call(arguments, 1));
            }
            return this;
        },
        reflow: noop,
        render: function(reflow) {
            if (reflow) {
                this.reflow();
            }
            if (this.options.animation && !reflow) {
                helpers.animationLoop(this.draw, this.options.animationSteps, this.options.animationEasing, this.options.onAnimationProgress, this.options.onAnimationComplete, this);
            } else {
                this.draw();
                this.options.onAnimationComplete.call(this);
            }
            return this;
        },
        generateLegend: function() {
            return template(this.options.legendTemplate, this);
        },
        destroy: function() {
            this.clear();
            unbindEvents(this, this.events);
            var canvas = this.chart.canvas;
            canvas.width = this.chart.width;
            canvas.height = this.chart.height;
            if (canvas.style.removeProperty) {
                canvas.style.removeProperty("width");
                canvas.style.removeProperty("height");
            } else {
                canvas.style.removeAttribute("width");
                canvas.style.removeAttribute("height");
            }
            delete Chart.instances[this.id];
        },
        showTooltip: function(ChartElements, forceRedraw) {
            if (typeof this.activeElements === "undefined") this.activeElements = [];
            var isChanged = function(Elements) {
                var changed = false;
                if (Elements.length !== this.activeElements.length) {
                    changed = true;
                    return changed;
                }
                each(Elements, function(element, index) {
                    if (element !== this.activeElements[index]) {
                        changed = true;
                    }
                }, this);
                return changed;
            }.call(this, ChartElements);
            if (!isChanged && !forceRedraw) {
                return;
            } else {
                this.activeElements = ChartElements;
            }
            this.draw();
            if (this.options.customTooltips) {
                this.options.customTooltips(false);
            }
            if (ChartElements.length > 0) {
                if (this.datasets && this.datasets.length > 1) {
                    var dataArray, dataIndex;
                    for (var i = this.datasets.length - 1; i >= 0; i--) {
                        dataArray = this.datasets[i].points || this.datasets[i].bars || this.datasets[i].segments;
                        dataIndex = indexOf(dataArray, ChartElements[0]);
                        if (dataIndex !== -1) {
                            break;
                        }
                    }
                    var tooltipLabels = [], tooltipColors = [], medianPosition = function(index) {
                        var Elements = [], dataCollection, xPositions = [], yPositions = [], xMax, yMax, xMin, yMin;
                        helpers.each(this.datasets, function(dataset) {
                            dataCollection = dataset.points || dataset.bars || dataset.segments;
                            if (dataCollection[dataIndex] && dataCollection[dataIndex].hasValue()) {
                                Elements.push(dataCollection[dataIndex]);
                            }
                        });
                        helpers.each(Elements, function(element) {
                            xPositions.push(element.x);
                            yPositions.push(element.y);
                            tooltipLabels.push(helpers.template(this.options.multiTooltipTemplate, element));
                            tooltipColors.push({
                                fill: element._saved.fillColor || element.fillColor,
                                stroke: element._saved.strokeColor || element.strokeColor
                            });
                        }, this);
                        yMin = min(yPositions);
                        yMax = max(yPositions);
                        xMin = min(xPositions);
                        xMax = max(xPositions);
                        return {
                            x: xMin > this.chart.width / 2 ? xMin : xMax,
                            y: (yMin + yMax) / 2
                        };
                    }.call(this, dataIndex);
                    new Chart.MultiTooltip({
                        x: medianPosition.x,
                        y: medianPosition.y,
                        xPadding: this.options.tooltipXPadding,
                        yPadding: this.options.tooltipYPadding,
                        xOffset: this.options.tooltipXOffset,
                        fillColor: this.options.tooltipFillColor,
                        textColor: this.options.tooltipFontColor,
                        fontFamily: this.options.tooltipFontFamily,
                        fontStyle: this.options.tooltipFontStyle,
                        fontSize: this.options.tooltipFontSize,
                        titleTextColor: this.options.tooltipTitleFontColor,
                        titleFontFamily: this.options.tooltipTitleFontFamily,
                        titleFontStyle: this.options.tooltipTitleFontStyle,
                        titleFontSize: this.options.tooltipTitleFontSize,
                        cornerRadius: this.options.tooltipCornerRadius,
                        labels: tooltipLabels,
                        legendColors: tooltipColors,
                        legendColorBackground: this.options.multiTooltipKeyBackground,
                        title: ChartElements[0].label,
                        chart: this.chart,
                        ctx: this.chart.ctx,
                        custom: this.options.customTooltips
                    }).draw();
                } else {
                    each(ChartElements, function(Element) {
                        var tooltipPosition = Element.tooltipPosition();
                        new Chart.Tooltip({
                            x: Math.round(tooltipPosition.x),
                            y: Math.round(tooltipPosition.y),
                            xPadding: this.options.tooltipXPadding,
                            yPadding: this.options.tooltipYPadding,
                            fillColor: this.options.tooltipFillColor,
                            textColor: this.options.tooltipFontColor,
                            fontFamily: this.options.tooltipFontFamily,
                            fontStyle: this.options.tooltipFontStyle,
                            fontSize: this.options.tooltipFontSize,
                            caretHeight: this.options.tooltipCaretSize,
                            cornerRadius: this.options.tooltipCornerRadius,
                            text: template(this.options.tooltipTemplate, Element),
                            chart: this.chart,
                            custom: this.options.customTooltips
                        }).draw();
                    }, this);
                }
            }
            return this;
        },
        toBase64Image: function() {
            return this.chart.canvas.toDataURL.apply(this.chart.canvas, arguments);
        }
    });
    Chart.Type.extend = function(extensions) {
        var parent = this;
        var ChartType = function() {
            return parent.apply(this, arguments);
        };
        ChartType.prototype = clone(parent.prototype);
        extend(ChartType.prototype, extensions);
        ChartType.extend = Chart.Type.extend;
        if (extensions.name || parent.prototype.name) {
            var chartName = extensions.name || parent.prototype.name;
            var baseDefaults = Chart.defaults[parent.prototype.name] ? clone(Chart.defaults[parent.prototype.name]) : {};
            Chart.defaults[chartName] = extend(baseDefaults, extensions.defaults);
            Chart.types[chartName] = ChartType;
            Chart.prototype[chartName] = function(data, options) {
                var config = merge(Chart.defaults.global, Chart.defaults[chartName], options || {});
                return new ChartType(data, config, this);
            };
        } else {
            warn("Name not provided for this chart, so it hasn't been registered");
        }
        return parent;
    };
    Chart.Element = function(configuration) {
        extend(this, configuration);
        this.initialize.apply(this, arguments);
        this.save();
    };
    extend(Chart.Element.prototype, {
        initialize: function() {},
        restore: function(props) {
            if (!props) {
                extend(this, this._saved);
            } else {
                each(props, function(key) {
                    this[key] = this._saved[key];
                }, this);
            }
            return this;
        },
        save: function() {
            this._saved = clone(this);
            delete this._saved._saved;
            return this;
        },
        update: function(newProps) {
            each(newProps, function(value, key) {
                this._saved[key] = this[key];
                this[key] = value;
            }, this);
            return this;
        },
        transition: function(props, ease) {
            each(props, function(value, key) {
                this[key] = (value - this._saved[key]) * ease + this._saved[key];
            }, this);
            return this;
        },
        tooltipPosition: function() {
            return {
                x: this.x,
                y: this.y
            };
        },
        hasValue: function() {
            return isNumber(this.value);
        }
    });
    Chart.Element.extend = inherits;
    Chart.Point = Chart.Element.extend({
        display: true,
        inRange: function(chartX, chartY) {
            var hitDetectionRange = this.hitDetectionRadius + this.radius;
            return Math.pow(chartX - this.x, 2) + Math.pow(chartY - this.y, 2) < Math.pow(hitDetectionRange, 2);
        },
        draw: function() {
            if (this.display) {
                var ctx = this.ctx;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.strokeStyle = this.strokeColor;
                ctx.lineWidth = this.strokeWidth;
                ctx.fillStyle = this.fillColor;
                ctx.fill();
                ctx.stroke();
            }
        }
    });
    Chart.Arc = Chart.Element.extend({
        inRange: function(chartX, chartY) {
            var pointRelativePosition = helpers.getAngleFromPoint(this, {
                x: chartX,
                y: chartY
            });
            var betweenAngles = pointRelativePosition.angle >= this.startAngle && pointRelativePosition.angle <= this.endAngle, withinRadius = pointRelativePosition.distance >= this.innerRadius && pointRelativePosition.distance <= this.outerRadius;
            return betweenAngles && withinRadius;
        },
        tooltipPosition: function() {
            var centreAngle = this.startAngle + (this.endAngle - this.startAngle) / 2, rangeFromCentre = (this.outerRadius - this.innerRadius) / 2 + this.innerRadius;
            return {
                x: this.x + Math.cos(centreAngle) * rangeFromCentre,
                y: this.y + Math.sin(centreAngle) * rangeFromCentre
            };
        },
        draw: function(animationPercent) {
            var easingDecimal = animationPercent || 1;
            var ctx = this.ctx;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.outerRadius, this.startAngle, this.endAngle);
            ctx.arc(this.x, this.y, this.innerRadius, this.endAngle, this.startAngle, true);
            ctx.closePath();
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.fillStyle = this.fillColor;
            ctx.fill();
            ctx.lineJoin = "bevel";
            if (this.showStroke) {
                ctx.stroke();
            }
        }
    });
    Chart.Rectangle = Chart.Element.extend({
        draw: function() {
            var ctx = this.ctx, halfWidth = this.width / 2, leftX = this.x - halfWidth, rightX = this.x + halfWidth, top = this.base - (this.base - this.y), halfStroke = this.strokeWidth / 2;
            if (this.showStroke) {
                leftX += halfStroke;
                rightX -= halfStroke;
                top += halfStroke;
            }
            ctx.beginPath();
            ctx.fillStyle = this.fillColor;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.moveTo(leftX, this.base);
            ctx.lineTo(leftX, top);
            ctx.lineTo(rightX, top);
            ctx.lineTo(rightX, this.base);
            ctx.fill();
            if (this.showStroke) {
                ctx.stroke();
            }
        },
        height: function() {
            return this.base - this.y;
        },
        inRange: function(chartX, chartY) {
            return chartX >= this.x - this.width / 2 && chartX <= this.x + this.width / 2 && (chartY >= this.y && chartY <= this.base);
        }
    });
    Chart.Tooltip = Chart.Element.extend({
        draw: function() {
            var ctx = this.chart.ctx;
            ctx.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);
            this.xAlign = "center";
            this.yAlign = "above";
            var caretPadding = this.caretPadding = 2;
            var tooltipWidth = ctx.measureText(this.text).width + 2 * this.xPadding, tooltipRectHeight = this.fontSize + 2 * this.yPadding, tooltipHeight = tooltipRectHeight + this.caretHeight + caretPadding;
            if (this.x + tooltipWidth / 2 > this.chart.width) {
                this.xAlign = "left";
            } else if (this.x - tooltipWidth / 2 < 0) {
                this.xAlign = "right";
            }
            if (this.y - tooltipHeight < 0) {
                this.yAlign = "below";
            }
            var tooltipX = this.x - tooltipWidth / 2, tooltipY = this.y - tooltipHeight;
            ctx.fillStyle = this.fillColor;
            if (this.custom) {
                this.custom(this);
            } else {
                switch (this.yAlign) {
                  case "above":
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - caretPadding);
                    ctx.lineTo(this.x + this.caretHeight, this.y - (caretPadding + this.caretHeight));
                    ctx.lineTo(this.x - this.caretHeight, this.y - (caretPadding + this.caretHeight));
                    ctx.closePath();
                    ctx.fill();
                    break;

                  case "below":
                    tooltipY = this.y + caretPadding + this.caretHeight;
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y + caretPadding);
                    ctx.lineTo(this.x + this.caretHeight, this.y + caretPadding + this.caretHeight);
                    ctx.lineTo(this.x - this.caretHeight, this.y + caretPadding + this.caretHeight);
                    ctx.closePath();
                    ctx.fill();
                    break;
                }
                switch (this.xAlign) {
                  case "left":
                    tooltipX = this.x - tooltipWidth + (this.cornerRadius + this.caretHeight);
                    break;

                  case "right":
                    tooltipX = this.x - (this.cornerRadius + this.caretHeight);
                    break;
                }
                drawRoundedRectangle(ctx, tooltipX, tooltipY, tooltipWidth, tooltipRectHeight, this.cornerRadius);
                ctx.fill();
                ctx.fillStyle = this.textColor;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.text, tooltipX + tooltipWidth / 2, tooltipY + tooltipRectHeight / 2);
            }
        }
    });
    Chart.MultiTooltip = Chart.Element.extend({
        initialize: function() {
            this.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);
            this.titleFont = fontString(this.titleFontSize, this.titleFontStyle, this.titleFontFamily);
            this.height = this.labels.length * this.fontSize + (this.labels.length - 1) * (this.fontSize / 2) + this.yPadding * 2 + this.titleFontSize * 1.5;
            this.ctx.font = this.titleFont;
            var titleWidth = this.ctx.measureText(this.title).width, labelWidth = longestText(this.ctx, this.font, this.labels) + this.fontSize + 3, longestTextWidth = max([ labelWidth, titleWidth ]);
            this.width = longestTextWidth + this.xPadding * 2;
            var halfHeight = this.height / 2;
            if (this.y - halfHeight < 0) {
                this.y = halfHeight;
            } else if (this.y + halfHeight > this.chart.height) {
                this.y = this.chart.height - halfHeight;
            }
            if (this.x > this.chart.width / 2) {
                this.x -= this.xOffset + this.width;
            } else {
                this.x += this.xOffset;
            }
        },
        getLineHeight: function(index) {
            var baseLineHeight = this.y - this.height / 2 + this.yPadding, afterTitleIndex = index - 1;
            if (index === 0) {
                return baseLineHeight + this.titleFontSize / 2;
            } else {
                return baseLineHeight + (this.fontSize * 1.5 * afterTitleIndex + this.fontSize / 2) + this.titleFontSize * 1.5;
            }
        },
        draw: function() {
            if (this.custom) {
                this.custom(this);
            } else {
                drawRoundedRectangle(this.ctx, this.x, this.y - this.height / 2, this.width, this.height, this.cornerRadius);
                var ctx = this.ctx;
                ctx.fillStyle = this.fillColor;
                ctx.fill();
                ctx.closePath();
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillStyle = this.titleTextColor;
                ctx.font = this.titleFont;
                ctx.fillText(this.title, this.x + this.xPadding, this.getLineHeight(0));
                ctx.font = this.font;
                helpers.each(this.labels, function(label, index) {
                    ctx.fillStyle = this.textColor;
                    ctx.fillText(label, this.x + this.xPadding + this.fontSize + 3, this.getLineHeight(index + 1));
                    ctx.fillStyle = this.legendColorBackground;
                    ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize / 2, this.fontSize, this.fontSize);
                    ctx.fillStyle = this.legendColors[index].fill;
                    ctx.fillRect(this.x + this.xPadding, this.getLineHeight(index + 1) - this.fontSize / 2, this.fontSize, this.fontSize);
                }, this);
            }
        }
    });
    Chart.Scale = Chart.Element.extend({
        initialize: function() {
            this.fit();
        },
        buildYLabels: function() {
            this.yLabels = [];
            var stepDecimalPlaces = getDecimalPlaces(this.stepValue);
            for (var i = 0; i <= this.steps; i++) {
                this.yLabels.push(template(this.templateString, {
                    value: (this.min + i * this.stepValue).toFixed(stepDecimalPlaces)
                }));
            }
            this.yLabelWidth = this.display && this.showLabels ? longestText(this.ctx, this.font, this.yLabels) : 0;
        },
        addXLabel: function(label) {
            this.xLabels.push(label);
            this.valuesCount++;
            this.fit();
        },
        removeXLabel: function() {
            this.xLabels.shift();
            this.valuesCount--;
            this.fit();
        },
        fit: function() {
            this.startPoint = this.display ? this.fontSize : 0;
            this.endPoint = this.display ? this.height - this.fontSize * 1.5 - 5 : this.height;
            this.startPoint += this.padding;
            this.endPoint -= this.padding;
            var cachedHeight = this.endPoint - this.startPoint, cachedYLabelWidth;
            this.calculateYRange(cachedHeight);
            this.buildYLabels();
            this.calculateXLabelRotation();
            while (cachedHeight > this.endPoint - this.startPoint) {
                cachedHeight = this.endPoint - this.startPoint;
                cachedYLabelWidth = this.yLabelWidth;
                this.calculateYRange(cachedHeight);
                this.buildYLabels();
                if (cachedYLabelWidth < this.yLabelWidth) {
                    this.calculateXLabelRotation();
                }
            }
        },
        calculateXLabelRotation: function() {
            this.ctx.font = this.font;
            var firstWidth = this.ctx.measureText(this.xLabels[0]).width, lastWidth = this.ctx.measureText(this.xLabels[this.xLabels.length - 1]).width, firstRotated, lastRotated;
            this.xScalePaddingRight = lastWidth / 2 + 3;
            this.xScalePaddingLeft = firstWidth / 2 > this.yLabelWidth + 10 ? firstWidth / 2 : this.yLabelWidth + 10;
            this.xLabelRotation = 0;
            if (this.display) {
                var originalLabelWidth = longestText(this.ctx, this.font, this.xLabels), cosRotation, firstRotatedWidth;
                this.xLabelWidth = originalLabelWidth;
                var xGridWidth = Math.floor(this.calculateX(1) - this.calculateX(0)) - 6;
                while (this.xLabelWidth > xGridWidth && this.xLabelRotation === 0 || this.xLabelWidth > xGridWidth && this.xLabelRotation <= 90 && this.xLabelRotation > 0) {
                    cosRotation = Math.cos(toRadians(this.xLabelRotation));
                    firstRotated = cosRotation * firstWidth;
                    lastRotated = cosRotation * lastWidth;
                    if (firstRotated + this.fontSize / 2 > this.yLabelWidth + 8) {
                        this.xScalePaddingLeft = firstRotated + this.fontSize / 2;
                    }
                    this.xScalePaddingRight = this.fontSize / 2;
                    this.xLabelRotation++;
                    this.xLabelWidth = cosRotation * originalLabelWidth;
                }
                if (this.xLabelRotation > 0) {
                    this.endPoint -= Math.sin(toRadians(this.xLabelRotation)) * originalLabelWidth + 3;
                }
            } else {
                this.xLabelWidth = 0;
                this.xScalePaddingRight = this.padding;
                this.xScalePaddingLeft = this.padding;
            }
        },
        calculateYRange: noop,
        drawingArea: function() {
            return this.startPoint - this.endPoint;
        },
        calculateY: function(value) {
            var scalingFactor = this.drawingArea() / (this.min - this.max);
            return this.endPoint - scalingFactor * (value - this.min);
        },
        calculateX: function(index) {
            var isRotated = this.xLabelRotation > 0, innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight), valueWidth = innerWidth / Math.max(this.valuesCount - (this.offsetGridLines ? 0 : 1), 1), valueOffset = valueWidth * index + this.xScalePaddingLeft;
            if (this.offsetGridLines) {
                valueOffset += valueWidth / 2;
            }
            return Math.round(valueOffset);
        },
        update: function(newProps) {
            helpers.extend(this, newProps);
            this.fit();
        },
        draw: function() {
            var ctx = this.ctx, yLabelGap = (this.endPoint - this.startPoint) / this.steps, xStart = Math.round(this.xScalePaddingLeft);
            if (this.display) {
                ctx.fillStyle = this.textColor;
                ctx.font = this.font;
                each(this.yLabels, function(labelString, index) {
                    var yLabelCenter = this.endPoint - yLabelGap * index, linePositionY = Math.round(yLabelCenter), drawHorizontalLine = this.showHorizontalLines;
                    ctx.textAlign = "right";
                    ctx.textBaseline = "middle";
                    if (this.showLabels) {
                        ctx.fillText(labelString, xStart - 10, yLabelCenter);
                    }
                    if (index === 0 && !drawHorizontalLine) {
                        drawHorizontalLine = true;
                    }
                    if (drawHorizontalLine) {
                        ctx.beginPath();
                    }
                    if (index > 0) {
                        ctx.lineWidth = this.gridLineWidth;
                        ctx.strokeStyle = this.gridLineColor;
                    } else {
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.lineColor;
                    }
                    linePositionY += helpers.aliasPixel(ctx.lineWidth);
                    if (drawHorizontalLine) {
                        ctx.moveTo(xStart, linePositionY);
                        ctx.lineTo(this.width, linePositionY);
                        ctx.stroke();
                        ctx.closePath();
                    }
                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;
                    ctx.beginPath();
                    ctx.moveTo(xStart - 5, linePositionY);
                    ctx.lineTo(xStart, linePositionY);
                    ctx.stroke();
                    ctx.closePath();
                }, this);
                each(this.xLabels, function(label, index) {
                    var xPos = this.calculateX(index) + aliasPixel(this.lineWidth), linePos = this.calculateX(index - (this.offsetGridLines ? .5 : 0)) + aliasPixel(this.lineWidth), isRotated = this.xLabelRotation > 0, drawVerticalLine = this.showVerticalLines;
                    if (index === 0 && !drawVerticalLine) {
                        drawVerticalLine = true;
                    }
                    if (drawVerticalLine) {
                        ctx.beginPath();
                    }
                    if (index > 0) {
                        ctx.lineWidth = this.gridLineWidth;
                        ctx.strokeStyle = this.gridLineColor;
                    } else {
                        ctx.lineWidth = this.lineWidth;
                        ctx.strokeStyle = this.lineColor;
                    }
                    if (drawVerticalLine) {
                        ctx.moveTo(linePos, this.endPoint);
                        ctx.lineTo(linePos, this.startPoint - 3);
                        ctx.stroke();
                        ctx.closePath();
                    }
                    ctx.lineWidth = this.lineWidth;
                    ctx.strokeStyle = this.lineColor;
                    ctx.beginPath();
                    ctx.moveTo(linePos, this.endPoint);
                    ctx.lineTo(linePos, this.endPoint + 5);
                    ctx.stroke();
                    ctx.closePath();
                    ctx.save();
                    ctx.translate(xPos, isRotated ? this.endPoint + 12 : this.endPoint + 8);
                    ctx.rotate(toRadians(this.xLabelRotation) * -1);
                    ctx.font = this.font;
                    ctx.textAlign = isRotated ? "right" : "center";
                    ctx.textBaseline = isRotated ? "middle" : "top";
                    ctx.fillText(label, 0, 0);
                    ctx.restore();
                }, this);
            }
        }
    });
    Chart.RadialScale = Chart.Element.extend({
        initialize: function() {
            this.size = min([ this.height, this.width ]);
            this.drawingArea = this.display ? this.size / 2 - (this.fontSize / 2 + this.backdropPaddingY) : this.size / 2;
        },
        calculateCenterOffset: function(value) {
            var scalingFactor = this.drawingArea / (this.max - this.min);
            return (value - this.min) * scalingFactor;
        },
        update: function() {
            if (!this.lineArc) {
                this.setScaleSize();
            } else {
                this.drawingArea = this.display ? this.size / 2 - (this.fontSize / 2 + this.backdropPaddingY) : this.size / 2;
            }
            this.buildYLabels();
        },
        buildYLabels: function() {
            this.yLabels = [];
            var stepDecimalPlaces = getDecimalPlaces(this.stepValue);
            for (var i = 0; i <= this.steps; i++) {
                this.yLabels.push(template(this.templateString, {
                    value: (this.min + i * this.stepValue).toFixed(stepDecimalPlaces)
                }));
            }
        },
        getCircumference: function() {
            return Math.PI * 2 / this.valuesCount;
        },
        setScaleSize: function() {
            var largestPossibleRadius = min([ this.height / 2 - this.pointLabelFontSize - 5, this.width / 2 ]), pointPosition, i, textWidth, halfTextWidth, furthestRight = this.width, furthestRightIndex, furthestRightAngle, furthestLeft = 0, furthestLeftIndex, furthestLeftAngle, xProtrusionLeft, xProtrusionRight, radiusReductionRight, radiusReductionLeft, maxWidthRadius;
            this.ctx.font = fontString(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily);
            for (i = 0; i < this.valuesCount; i++) {
                pointPosition = this.getPointPosition(i, largestPossibleRadius);
                textWidth = this.ctx.measureText(template(this.templateString, {
                    value: this.labels[i]
                })).width + 5;
                if (i === 0 || i === this.valuesCount / 2) {
                    halfTextWidth = textWidth / 2;
                    if (pointPosition.x + halfTextWidth > furthestRight) {
                        furthestRight = pointPosition.x + halfTextWidth;
                        furthestRightIndex = i;
                    }
                    if (pointPosition.x - halfTextWidth < furthestLeft) {
                        furthestLeft = pointPosition.x - halfTextWidth;
                        furthestLeftIndex = i;
                    }
                } else if (i < this.valuesCount / 2) {
                    if (pointPosition.x + textWidth > furthestRight) {
                        furthestRight = pointPosition.x + textWidth;
                        furthestRightIndex = i;
                    }
                } else if (i > this.valuesCount / 2) {
                    if (pointPosition.x - textWidth < furthestLeft) {
                        furthestLeft = pointPosition.x - textWidth;
                        furthestLeftIndex = i;
                    }
                }
            }
            xProtrusionLeft = furthestLeft;
            xProtrusionRight = Math.ceil(furthestRight - this.width);
            furthestRightAngle = this.getIndexAngle(furthestRightIndex);
            furthestLeftAngle = this.getIndexAngle(furthestLeftIndex);
            radiusReductionRight = xProtrusionRight / Math.sin(furthestRightAngle + Math.PI / 2);
            radiusReductionLeft = xProtrusionLeft / Math.sin(furthestLeftAngle + Math.PI / 2);
            radiusReductionRight = isNumber(radiusReductionRight) ? radiusReductionRight : 0;
            radiusReductionLeft = isNumber(radiusReductionLeft) ? radiusReductionLeft : 0;
            this.drawingArea = largestPossibleRadius - (radiusReductionLeft + radiusReductionRight) / 2;
            this.setCenterPoint(radiusReductionLeft, radiusReductionRight);
        },
        setCenterPoint: function(leftMovement, rightMovement) {
            var maxRight = this.width - rightMovement - this.drawingArea, maxLeft = leftMovement + this.drawingArea;
            this.xCenter = (maxLeft + maxRight) / 2;
            this.yCenter = this.height / 2;
        },
        getIndexAngle: function(index) {
            var angleMultiplier = Math.PI * 2 / this.valuesCount;
            return index * angleMultiplier - Math.PI / 2;
        },
        getPointPosition: function(index, distanceFromCenter) {
            var thisAngle = this.getIndexAngle(index);
            return {
                x: Math.cos(thisAngle) * distanceFromCenter + this.xCenter,
                y: Math.sin(thisAngle) * distanceFromCenter + this.yCenter
            };
        },
        draw: function() {
            if (this.display) {
                var ctx = this.ctx;
                each(this.yLabels, function(label, index) {
                    if (index > 0) {
                        var yCenterOffset = index * (this.drawingArea / this.steps), yHeight = this.yCenter - yCenterOffset, pointPosition;
                        if (this.lineWidth > 0) {
                            ctx.strokeStyle = this.lineColor;
                            ctx.lineWidth = this.lineWidth;
                            if (this.lineArc) {
                                ctx.beginPath();
                                ctx.arc(this.xCenter, this.yCenter, yCenterOffset, 0, Math.PI * 2);
                                ctx.closePath();
                                ctx.stroke();
                            } else {
                                ctx.beginPath();
                                for (var i = 0; i < this.valuesCount; i++) {
                                    pointPosition = this.getPointPosition(i, this.calculateCenterOffset(this.min + index * this.stepValue));
                                    if (i === 0) {
                                        ctx.moveTo(pointPosition.x, pointPosition.y);
                                    } else {
                                        ctx.lineTo(pointPosition.x, pointPosition.y);
                                    }
                                }
                                ctx.closePath();
                                ctx.stroke();
                            }
                        }
                        if (this.showLabels) {
                            ctx.font = fontString(this.fontSize, this.fontStyle, this.fontFamily);
                            if (this.showLabelBackdrop) {
                                var labelWidth = ctx.measureText(label).width;
                                ctx.fillStyle = this.backdropColor;
                                ctx.fillRect(this.xCenter - labelWidth / 2 - this.backdropPaddingX, yHeight - this.fontSize / 2 - this.backdropPaddingY, labelWidth + this.backdropPaddingX * 2, this.fontSize + this.backdropPaddingY * 2);
                            }
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillStyle = this.fontColor;
                            ctx.fillText(label, this.xCenter, yHeight);
                        }
                    }
                }, this);
                if (!this.lineArc) {
                    ctx.lineWidth = this.angleLineWidth;
                    ctx.strokeStyle = this.angleLineColor;
                    for (var i = this.valuesCount - 1; i >= 0; i--) {
                        if (this.angleLineWidth > 0) {
                            var outerPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max));
                            ctx.beginPath();
                            ctx.moveTo(this.xCenter, this.yCenter);
                            ctx.lineTo(outerPosition.x, outerPosition.y);
                            ctx.stroke();
                            ctx.closePath();
                        }
                        var pointLabelPosition = this.getPointPosition(i, this.calculateCenterOffset(this.max) + 5);
                        ctx.font = fontString(this.pointLabelFontSize, this.pointLabelFontStyle, this.pointLabelFontFamily);
                        ctx.fillStyle = this.pointLabelFontColor;
                        var labelsCount = this.labels.length, halfLabelsCount = this.labels.length / 2, quarterLabelsCount = halfLabelsCount / 2, upperHalf = i < quarterLabelsCount || i > labelsCount - quarterLabelsCount, exactQuarter = i === quarterLabelsCount || i === labelsCount - quarterLabelsCount;
                        if (i === 0) {
                            ctx.textAlign = "center";
                        } else if (i === halfLabelsCount) {
                            ctx.textAlign = "center";
                        } else if (i < halfLabelsCount) {
                            ctx.textAlign = "left";
                        } else {
                            ctx.textAlign = "right";
                        }
                        if (exactQuarter) {
                            ctx.textBaseline = "middle";
                        } else if (upperHalf) {
                            ctx.textBaseline = "bottom";
                        } else {
                            ctx.textBaseline = "top";
                        }
                        ctx.fillText(this.labels[i], pointLabelPosition.x, pointLabelPosition.y);
                    }
                }
            }
        }
    });
    helpers.addEvent(window, "resize", function() {
        var timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                each(Chart.instances, function(instance) {
                    if (instance.options.responsive) {
                        instance.resize(instance.render, true);
                    }
                });
            }, 50);
        };
    }());
    if (amd) {
        define(function() {
            return Chart;
        });
    } else if (typeof module === "object" && module.exports) {
        module.exports = Chart;
    }
    root.Chart = Chart;
    Chart.noConflict = function() {
        root.Chart = previous;
        return Chart;
    };
}).call(this);

(function() {
    "use strict";
    var root = this, Chart = root.Chart, helpers = Chart.helpers;
    var defaultConfig = {
        scaleBeginAtZero: true,
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        scaleShowHorizontalLines: true,
        scaleShowVerticalLines: true,
        barShowStroke: true,
        barStrokeWidth: 2,
        barValueSpacing: 5,
        barDatasetSpacing: 1,
        legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].fillColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };
    Chart.Type.extend({
        name: "Bar",
        defaults: defaultConfig,
        initialize: function(data) {
            var options = this.options;
            this.ScaleClass = Chart.Scale.extend({
                offsetGridLines: true,
                calculateBarX: function(datasetCount, datasetIndex, barIndex) {
                    var xWidth = this.calculateBaseWidth(), xAbsolute = this.calculateX(barIndex) - xWidth / 2, barWidth = this.calculateBarWidth(datasetCount);
                    return xAbsolute + barWidth * datasetIndex + datasetIndex * options.barDatasetSpacing + barWidth / 2;
                },
                calculateBaseWidth: function() {
                    return this.calculateX(1) - this.calculateX(0) - 2 * options.barValueSpacing;
                },
                calculateBarWidth: function(datasetCount) {
                    var baseWidth = this.calculateBaseWidth() - (datasetCount - 1) * options.barDatasetSpacing;
                    return baseWidth / datasetCount;
                }
            });
            this.datasets = [];
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activeBars = evt.type !== "mouseout" ? this.getBarsAtEvent(evt) : [];
                    this.eachBars(function(bar) {
                        bar.restore([ "fillColor", "strokeColor" ]);
                    });
                    helpers.each(activeBars, function(activeBar) {
                        activeBar.fillColor = activeBar.highlightFill;
                        activeBar.strokeColor = activeBar.highlightStroke;
                    });
                    this.showTooltip(activeBars);
                });
            }
            this.BarClass = Chart.Rectangle.extend({
                strokeWidth: this.options.barStrokeWidth,
                showStroke: this.options.barShowStroke,
                ctx: this.chart.ctx
            });
            helpers.each(data.datasets, function(dataset, datasetIndex) {
                var datasetObject = {
                    label: dataset.label || null,
                    fillColor: dataset.fillColor,
                    strokeColor: dataset.strokeColor,
                    bars: []
                };
                this.datasets.push(datasetObject);
                helpers.each(dataset.data, function(dataPoint, index) {
                    datasetObject.bars.push(new this.BarClass({
                        value: dataPoint,
                        label: data.labels[index],
                        datasetLabel: dataset.label,
                        strokeColor: dataset.strokeColor,
                        fillColor: dataset.fillColor,
                        highlightFill: dataset.highlightFill || dataset.fillColor,
                        highlightStroke: dataset.highlightStroke || dataset.strokeColor
                    }));
                }, this);
            }, this);
            this.buildScale(data.labels);
            this.BarClass.prototype.base = this.scale.endPoint;
            this.eachBars(function(bar, index, datasetIndex) {
                helpers.extend(bar, {
                    width: this.scale.calculateBarWidth(this.datasets.length),
                    x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
                    y: this.scale.endPoint
                });
                bar.save();
            }, this);
            this.render();
        },
        update: function() {
            this.scale.update();
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore([ "fillColor", "strokeColor" ]);
            });
            this.eachBars(function(bar) {
                bar.save();
            });
            this.render();
        },
        eachBars: function(callback) {
            helpers.each(this.datasets, function(dataset, datasetIndex) {
                helpers.each(dataset.bars, callback, this, datasetIndex);
            }, this);
        },
        getBarsAtEvent: function(e) {
            var barsArray = [], eventPosition = helpers.getRelativePosition(e), datasetIterator = function(dataset) {
                barsArray.push(dataset.bars[barIndex]);
            }, barIndex;
            for (var datasetIndex = 0; datasetIndex < this.datasets.length; datasetIndex++) {
                for (barIndex = 0; barIndex < this.datasets[datasetIndex].bars.length; barIndex++) {
                    if (this.datasets[datasetIndex].bars[barIndex].inRange(eventPosition.x, eventPosition.y)) {
                        helpers.each(this.datasets, datasetIterator);
                        return barsArray;
                    }
                }
            }
            return barsArray;
        },
        buildScale: function(labels) {
            var self = this;
            var dataTotal = function() {
                var values = [];
                self.eachBars(function(bar) {
                    values.push(bar.value);
                });
                return values;
            };
            var scaleOptions = {
                templateString: this.options.scaleLabel,
                height: this.chart.height,
                width: this.chart.width,
                ctx: this.chart.ctx,
                textColor: this.options.scaleFontColor,
                fontSize: this.options.scaleFontSize,
                fontStyle: this.options.scaleFontStyle,
                fontFamily: this.options.scaleFontFamily,
                valuesCount: labels.length,
                beginAtZero: this.options.scaleBeginAtZero,
                integersOnly: this.options.scaleIntegersOnly,
                calculateYRange: function(currentHeight) {
                    var updatedRanges = helpers.calculateScaleRange(dataTotal(), currentHeight, this.fontSize, this.beginAtZero, this.integersOnly);
                    helpers.extend(this, updatedRanges);
                },
                xLabels: labels,
                font: helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth: this.options.scaleLineWidth,
                lineColor: this.options.scaleLineColor,
                showHorizontalLines: this.options.scaleShowHorizontalLines,
                showVerticalLines: this.options.scaleShowVerticalLines,
                gridLineWidth: this.options.scaleShowGridLines ? this.options.scaleGridLineWidth : 0,
                gridLineColor: this.options.scaleShowGridLines ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                padding: this.options.showScale ? 0 : this.options.barShowStroke ? this.options.barStrokeWidth : 0,
                showLabels: this.options.scaleShowLabels,
                display: this.options.showScale
            };
            if (this.options.scaleOverride) {
                helpers.extend(scaleOptions, {
                    calculateYRange: helpers.noop,
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
                });
            }
            this.scale = new this.ScaleClass(scaleOptions);
        },
        addData: function(valuesArray, label) {
            helpers.each(valuesArray, function(value, datasetIndex) {
                this.datasets[datasetIndex].bars.push(new this.BarClass({
                    value: value,
                    label: label,
                    x: this.scale.calculateBarX(this.datasets.length, datasetIndex, this.scale.valuesCount + 1),
                    y: this.scale.endPoint,
                    width: this.scale.calculateBarWidth(this.datasets.length),
                    base: this.scale.endPoint,
                    strokeColor: this.datasets[datasetIndex].strokeColor,
                    fillColor: this.datasets[datasetIndex].fillColor
                }));
            }, this);
            this.scale.addXLabel(label);
            this.update();
        },
        removeData: function() {
            this.scale.removeXLabel();
            helpers.each(this.datasets, function(dataset) {
                dataset.bars.shift();
            }, this);
            this.update();
        },
        reflow: function() {
            helpers.extend(this.BarClass.prototype, {
                y: this.scale.endPoint,
                base: this.scale.endPoint
            });
            var newScaleProps = helpers.extend({
                height: this.chart.height,
                width: this.chart.width
            });
            this.scale.update(newScaleProps);
        },
        draw: function(ease) {
            var easingDecimal = ease || 1;
            this.clear();
            var ctx = this.chart.ctx;
            this.scale.draw(easingDecimal);
            helpers.each(this.datasets, function(dataset, datasetIndex) {
                helpers.each(dataset.bars, function(bar, index) {
                    if (bar.hasValue()) {
                        bar.base = this.scale.endPoint;
                        bar.transition({
                            x: this.scale.calculateBarX(this.datasets.length, datasetIndex, index),
                            y: this.scale.calculateY(bar.value),
                            width: this.scale.calculateBarWidth(this.datasets.length)
                        }, easingDecimal).draw();
                    }
                }, this);
            }, this);
        }
    });
}).call(this);

(function() {
    "use strict";
    var root = this, Chart = root.Chart, helpers = Chart.helpers;
    var defaultConfig = {
        segmentShowStroke: true,
        segmentStrokeColor: "#fff",
        segmentStrokeWidth: 2,
        percentageInnerCutout: 50,
        animationSteps: 100,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false,
        legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'
    };
    Chart.Type.extend({
        name: "Doughnut",
        defaults: defaultConfig,
        initialize: function(data) {
            this.segments = [];
            this.outerRadius = (helpers.min([ this.chart.width, this.chart.height ]) - this.options.segmentStrokeWidth / 2) / 2;
            this.SegmentArc = Chart.Arc.extend({
                ctx: this.chart.ctx,
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activeSegments = evt.type !== "mouseout" ? this.getSegmentsAtEvent(evt) : [];
                    helpers.each(this.segments, function(segment) {
                        segment.restore([ "fillColor" ]);
                    });
                    helpers.each(activeSegments, function(activeSegment) {
                        activeSegment.fillColor = activeSegment.highlightColor;
                    });
                    this.showTooltip(activeSegments);
                });
            }
            this.calculateTotal(data);
            helpers.each(data, function(datapoint, index) {
                this.addData(datapoint, index, true);
            }, this);
            this.render();
        },
        getSegmentsAtEvent: function(e) {
            var segmentsArray = [];
            var location = helpers.getRelativePosition(e);
            helpers.each(this.segments, function(segment) {
                if (segment.inRange(location.x, location.y)) segmentsArray.push(segment);
            }, this);
            return segmentsArray;
        },
        addData: function(segment, atIndex, silent) {
            var index = atIndex || this.segments.length;
            this.segments.splice(index, 0, new this.SegmentArc({
                value: segment.value,
                outerRadius: this.options.animateScale ? 0 : this.outerRadius,
                innerRadius: this.options.animateScale ? 0 : this.outerRadius / 100 * this.options.percentageInnerCutout,
                fillColor: segment.color,
                highlightColor: segment.highlight || segment.color,
                showStroke: this.options.segmentShowStroke,
                strokeWidth: this.options.segmentStrokeWidth,
                strokeColor: this.options.segmentStrokeColor,
                startAngle: Math.PI * 1.5,
                circumference: this.options.animateRotate ? 0 : this.calculateCircumference(segment.value),
                label: segment.label
            }));
            if (!silent) {
                this.reflow();
                this.update();
            }
        },
        calculateCircumference: function(value) {
            return Math.PI * 2 * (Math.abs(value) / this.total);
        },
        calculateTotal: function(data) {
            this.total = 0;
            helpers.each(data, function(segment) {
                this.total += Math.abs(segment.value);
            }, this);
        },
        update: function() {
            this.calculateTotal(this.segments);
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore([ "fillColor" ]);
            });
            helpers.each(this.segments, function(segment) {
                segment.save();
            });
            this.render();
        },
        removeData: function(atIndex) {
            var indexToDelete = helpers.isNumber(atIndex) ? atIndex : this.segments.length - 1;
            this.segments.splice(indexToDelete, 1);
            this.reflow();
            this.update();
        },
        reflow: function() {
            helpers.extend(this.SegmentArc.prototype, {
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });
            this.outerRadius = (helpers.min([ this.chart.width, this.chart.height ]) - this.options.segmentStrokeWidth / 2) / 2;
            helpers.each(this.segments, function(segment) {
                segment.update({
                    outerRadius: this.outerRadius,
                    innerRadius: this.outerRadius / 100 * this.options.percentageInnerCutout
                });
            }, this);
        },
        draw: function(easeDecimal) {
            var animDecimal = easeDecimal ? easeDecimal : 1;
            this.clear();
            helpers.each(this.segments, function(segment, index) {
                segment.transition({
                    circumference: this.calculateCircumference(segment.value),
                    outerRadius: this.outerRadius,
                    innerRadius: this.outerRadius / 100 * this.options.percentageInnerCutout
                }, animDecimal);
                segment.endAngle = segment.startAngle + segment.circumference;
                segment.draw();
                if (index === 0) {
                    segment.startAngle = Math.PI * 1.5;
                }
                if (index < this.segments.length - 1) {
                    this.segments[index + 1].startAngle = segment.endAngle;
                }
            }, this);
        }
    });
    Chart.types.Doughnut.extend({
        name: "Pie",
        defaults: helpers.merge(defaultConfig, {
            percentageInnerCutout: 0
        })
    });
}).call(this);

(function() {
    "use strict";
    var root = this, Chart = root.Chart, helpers = Chart.helpers;
    var defaultConfig = {
        scaleShowGridLines: true,
        scaleGridLineColor: "rgba(0,0,0,.05)",
        scaleGridLineWidth: 1,
        scaleShowHorizontalLines: true,
        scaleShowVerticalLines: true,
        bezierCurve: true,
        bezierCurveTension: .4,
        pointDot: true,
        pointDotRadius: 4,
        pointDotStrokeWidth: 1,
        pointHitDetectionRadius: 20,
        datasetStroke: true,
        datasetStrokeWidth: 2,
        datasetFill: true,
        legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };
    Chart.Type.extend({
        name: "Line",
        defaults: defaultConfig,
        initialize: function(data) {
            this.PointClass = Chart.Point.extend({
                strokeWidth: this.options.pointDotStrokeWidth,
                radius: this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius: this.options.pointHitDetectionRadius,
                ctx: this.chart.ctx,
                inRange: function(mouseX) {
                    return Math.pow(mouseX - this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius, 2);
                }
            });
            this.datasets = [];
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activePoints = evt.type !== "mouseout" ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function(point) {
                        point.restore([ "fillColor", "strokeColor" ]);
                    });
                    helpers.each(activePoints, function(activePoint) {
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePoints);
                });
            }
            helpers.each(data.datasets, function(dataset) {
                var datasetObject = {
                    label: dataset.label || null,
                    fillColor: dataset.fillColor,
                    strokeColor: dataset.strokeColor,
                    pointColor: dataset.pointColor,
                    pointStrokeColor: dataset.pointStrokeColor,
                    points: []
                };
                this.datasets.push(datasetObject);
                helpers.each(dataset.data, function(dataPoint, index) {
                    datasetObject.points.push(new this.PointClass({
                        value: dataPoint,
                        label: data.labels[index],
                        datasetLabel: dataset.label,
                        strokeColor: dataset.pointStrokeColor,
                        fillColor: dataset.pointColor,
                        highlightFill: dataset.pointHighlightFill || dataset.pointColor,
                        highlightStroke: dataset.pointHighlightStroke || dataset.pointStrokeColor
                    }));
                }, this);
                this.buildScale(data.labels);
                this.eachPoints(function(point, index) {
                    helpers.extend(point, {
                        x: this.scale.calculateX(index),
                        y: this.scale.endPoint
                    });
                    point.save();
                }, this);
            }, this);
            this.render();
        },
        update: function() {
            this.scale.update();
            helpers.each(this.activeElements, function(activeElement) {
                activeElement.restore([ "fillColor", "strokeColor" ]);
            });
            this.eachPoints(function(point) {
                point.save();
            });
            this.render();
        },
        eachPoints: function(callback) {
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, callback, this);
            }, this);
        },
        getPointsAtEvent: function(e) {
            var pointsArray = [], eventPosition = helpers.getRelativePosition(e);
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, function(point) {
                    if (point.inRange(eventPosition.x, eventPosition.y)) pointsArray.push(point);
                });
            }, this);
            return pointsArray;
        },
        buildScale: function(labels) {
            var self = this;
            var dataTotal = function() {
                var values = [];
                self.eachPoints(function(point) {
                    values.push(point.value);
                });
                return values;
            };
            var scaleOptions = {
                templateString: this.options.scaleLabel,
                height: this.chart.height,
                width: this.chart.width,
                ctx: this.chart.ctx,
                textColor: this.options.scaleFontColor,
                fontSize: this.options.scaleFontSize,
                fontStyle: this.options.scaleFontStyle,
                fontFamily: this.options.scaleFontFamily,
                valuesCount: labels.length,
                beginAtZero: this.options.scaleBeginAtZero,
                integersOnly: this.options.scaleIntegersOnly,
                calculateYRange: function(currentHeight) {
                    var updatedRanges = helpers.calculateScaleRange(dataTotal(), currentHeight, this.fontSize, this.beginAtZero, this.integersOnly);
                    helpers.extend(this, updatedRanges);
                },
                xLabels: labels,
                font: helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
                lineWidth: this.options.scaleLineWidth,
                lineColor: this.options.scaleLineColor,
                showHorizontalLines: this.options.scaleShowHorizontalLines,
                showVerticalLines: this.options.scaleShowVerticalLines,
                gridLineWidth: this.options.scaleShowGridLines ? this.options.scaleGridLineWidth : 0,
                gridLineColor: this.options.scaleShowGridLines ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
                padding: this.options.showScale ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
                showLabels: this.options.scaleShowLabels,
                display: this.options.showScale
            };
            if (this.options.scaleOverride) {
                helpers.extend(scaleOptions, {
                    calculateYRange: helpers.noop,
                    steps: this.options.scaleSteps,
                    stepValue: this.options.scaleStepWidth,
                    min: this.options.scaleStartValue,
                    max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
                });
            }
            this.scale = new Chart.Scale(scaleOptions);
        },
        addData: function(valuesArray, label) {
            helpers.each(valuesArray, function(value, datasetIndex) {
                this.datasets[datasetIndex].points.push(new this.PointClass({
                    value: value,
                    label: label,
                    x: this.scale.calculateX(this.scale.valuesCount + 1),
                    y: this.scale.endPoint,
                    strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                    fillColor: this.datasets[datasetIndex].pointColor
                }));
            }, this);
            this.scale.addXLabel(label);
            this.update();
        },
        removeData: function() {
            this.scale.removeXLabel();
            helpers.each(this.datasets, function(dataset) {
                dataset.points.shift();
            }, this);
            this.update();
        },
        reflow: function() {
            var newScaleProps = helpers.extend({
                height: this.chart.height,
                width: this.chart.width
            });
            this.scale.update(newScaleProps);
        },
        draw: function(ease) {
            var easingDecimal = ease || 1;
            this.clear();
            var ctx = this.chart.ctx;
            var hasValue = function(item) {
                return item.value !== null;
            }, nextPoint = function(point, collection, index) {
                return helpers.findNextWhere(collection, hasValue, index) || point;
            }, previousPoint = function(point, collection, index) {
                return helpers.findPreviousWhere(collection, hasValue, index) || point;
            };
            this.scale.draw(easingDecimal);
            helpers.each(this.datasets, function(dataset) {
                var pointsWithValues = helpers.where(dataset.points, hasValue);
                helpers.each(dataset.points, function(point, index) {
                    if (point.hasValue()) {
                        point.transition({
                            y: this.scale.calculateY(point.value),
                            x: this.scale.calculateX(index)
                        }, easingDecimal);
                    }
                }, this);
                if (this.options.bezierCurve) {
                    helpers.each(pointsWithValues, function(point, index) {
                        var tension = index > 0 && index < pointsWithValues.length - 1 ? this.options.bezierCurveTension : 0;
                        point.controlPoints = helpers.splineCurve(previousPoint(point, pointsWithValues, index), point, nextPoint(point, pointsWithValues, index), tension);
                        if (point.controlPoints.outer.y > this.scale.endPoint) {
                            point.controlPoints.outer.y = this.scale.endPoint;
                        } else if (point.controlPoints.outer.y < this.scale.startPoint) {
                            point.controlPoints.outer.y = this.scale.startPoint;
                        }
                        if (point.controlPoints.inner.y > this.scale.endPoint) {
                            point.controlPoints.inner.y = this.scale.endPoint;
                        } else if (point.controlPoints.inner.y < this.scale.startPoint) {
                            point.controlPoints.inner.y = this.scale.startPoint;
                        }
                    }, this);
                }
                ctx.lineWidth = this.options.datasetStrokeWidth;
                ctx.strokeStyle = dataset.strokeColor;
                ctx.beginPath();
                helpers.each(pointsWithValues, function(point, index) {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        if (this.options.bezierCurve) {
                            var previous = previousPoint(point, pointsWithValues, index);
                            ctx.bezierCurveTo(previous.controlPoints.outer.x, previous.controlPoints.outer.y, point.controlPoints.inner.x, point.controlPoints.inner.y, point.x, point.y);
                        } else {
                            ctx.lineTo(point.x, point.y);
                        }
                    }
                }, this);
                ctx.stroke();
                if (this.options.datasetFill && pointsWithValues.length > 0) {
                    ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
                    ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
                    ctx.fillStyle = dataset.fillColor;
                    ctx.closePath();
                    ctx.fill();
                }
                helpers.each(pointsWithValues, function(point) {
                    point.draw();
                });
            }, this);
        }
    });
}).call(this);

(function() {
    "use strict";
    var root = this, Chart = root.Chart, helpers = Chart.helpers;
    var defaultConfig = {
        scaleShowLabelBackdrop: true,
        scaleBackdropColor: "rgba(255,255,255,0.75)",
        scaleBeginAtZero: true,
        scaleBackdropPaddingY: 2,
        scaleBackdropPaddingX: 2,
        scaleShowLine: true,
        segmentShowStroke: true,
        segmentStrokeColor: "#fff",
        segmentStrokeWidth: 2,
        animationSteps: 100,
        animationEasing: "easeOutBounce",
        animateRotate: true,
        animateScale: false,
        legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<segments.length; i++){%><li><span style="background-color:<%=segments[i].fillColor%>"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>'
    };
    Chart.Type.extend({
        name: "PolarArea",
        defaults: defaultConfig,
        initialize: function(data) {
            this.segments = [];
            this.SegmentArc = Chart.Arc.extend({
                showStroke: this.options.segmentShowStroke,
                strokeWidth: this.options.segmentStrokeWidth,
                strokeColor: this.options.segmentStrokeColor,
                ctx: this.chart.ctx,
                innerRadius: 0,
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });
            this.scale = new Chart.RadialScale({
                display: this.options.showScale,
                fontStyle: this.options.scaleFontStyle,
                fontSize: this.options.scaleFontSize,
                fontFamily: this.options.scaleFontFamily,
                fontColor: this.options.scaleFontColor,
                showLabels: this.options.scaleShowLabels,
                showLabelBackdrop: this.options.scaleShowLabelBackdrop,
                backdropColor: this.options.scaleBackdropColor,
                backdropPaddingY: this.options.scaleBackdropPaddingY,
                backdropPaddingX: this.options.scaleBackdropPaddingX,
                lineWidth: this.options.scaleShowLine ? this.options.scaleLineWidth : 0,
                lineColor: this.options.scaleLineColor,
                lineArc: true,
                width: this.chart.width,
                height: this.chart.height,
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2,
                ctx: this.chart.ctx,
                templateString: this.options.scaleLabel,
                valuesCount: data.length
            });
            this.updateScaleRange(data);
            this.scale.update();
            helpers.each(data, function(segment, index) {
                this.addData(segment, index, true);
            }, this);
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activeSegments = evt.type !== "mouseout" ? this.getSegmentsAtEvent(evt) : [];
                    helpers.each(this.segments, function(segment) {
                        segment.restore([ "fillColor" ]);
                    });
                    helpers.each(activeSegments, function(activeSegment) {
                        activeSegment.fillColor = activeSegment.highlightColor;
                    });
                    this.showTooltip(activeSegments);
                });
            }
            this.render();
        },
        getSegmentsAtEvent: function(e) {
            var segmentsArray = [];
            var location = helpers.getRelativePosition(e);
            helpers.each(this.segments, function(segment) {
                if (segment.inRange(location.x, location.y)) segmentsArray.push(segment);
            }, this);
            return segmentsArray;
        },
        addData: function(segment, atIndex, silent) {
            var index = atIndex || this.segments.length;
            this.segments.splice(index, 0, new this.SegmentArc({
                fillColor: segment.color,
                highlightColor: segment.highlight || segment.color,
                label: segment.label,
                value: segment.value,
                outerRadius: this.options.animateScale ? 0 : this.scale.calculateCenterOffset(segment.value),
                circumference: this.options.animateRotate ? 0 : this.scale.getCircumference(),
                startAngle: Math.PI * 1.5
            }));
            if (!silent) {
                this.reflow();
                this.update();
            }
        },
        removeData: function(atIndex) {
            var indexToDelete = helpers.isNumber(atIndex) ? atIndex : this.segments.length - 1;
            this.segments.splice(indexToDelete, 1);
            this.reflow();
            this.update();
        },
        calculateTotal: function(data) {
            this.total = 0;
            helpers.each(data, function(segment) {
                this.total += segment.value;
            }, this);
            this.scale.valuesCount = this.segments.length;
        },
        updateScaleRange: function(datapoints) {
            var valuesArray = [];
            helpers.each(datapoints, function(segment) {
                valuesArray.push(segment.value);
            });
            var scaleSizes = this.options.scaleOverride ? {
                steps: this.options.scaleSteps,
                stepValue: this.options.scaleStepWidth,
                min: this.options.scaleStartValue,
                max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
            } : helpers.calculateScaleRange(valuesArray, helpers.min([ this.chart.width, this.chart.height ]) / 2, this.options.scaleFontSize, this.options.scaleBeginAtZero, this.options.scaleIntegersOnly);
            helpers.extend(this.scale, scaleSizes, {
                size: helpers.min([ this.chart.width, this.chart.height ]),
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2
            });
        },
        update: function() {
            this.calculateTotal(this.segments);
            helpers.each(this.segments, function(segment) {
                segment.save();
            });
            this.reflow();
            this.render();
        },
        reflow: function() {
            helpers.extend(this.SegmentArc.prototype, {
                x: this.chart.width / 2,
                y: this.chart.height / 2
            });
            this.updateScaleRange(this.segments);
            this.scale.update();
            helpers.extend(this.scale, {
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2
            });
            helpers.each(this.segments, function(segment) {
                segment.update({
                    outerRadius: this.scale.calculateCenterOffset(segment.value)
                });
            }, this);
        },
        draw: function(ease) {
            var easingDecimal = ease || 1;
            this.clear();
            helpers.each(this.segments, function(segment, index) {
                segment.transition({
                    circumference: this.scale.getCircumference(),
                    outerRadius: this.scale.calculateCenterOffset(segment.value)
                }, easingDecimal);
                segment.endAngle = segment.startAngle + segment.circumference;
                if (index === 0) {
                    segment.startAngle = Math.PI * 1.5;
                }
                if (index < this.segments.length - 1) {
                    this.segments[index + 1].startAngle = segment.endAngle;
                }
                segment.draw();
            }, this);
            this.scale.draw();
        }
    });
}).call(this);

(function() {
    "use strict";
    var root = this, Chart = root.Chart, helpers = Chart.helpers;
    Chart.Type.extend({
        name: "Radar",
        defaults: {
            scaleShowLine: true,
            angleShowLineOut: true,
            scaleShowLabels: false,
            scaleBeginAtZero: true,
            angleLineColor: "rgba(0,0,0,.1)",
            angleLineWidth: 1,
            pointLabelFontFamily: "'Arial'",
            pointLabelFontStyle: "normal",
            pointLabelFontSize: 10,
            pointLabelFontColor: "#666",
            pointDot: true,
            pointDotRadius: 3,
            pointDotStrokeWidth: 1,
            pointHitDetectionRadius: 20,
            datasetStroke: true,
            datasetStrokeWidth: 2,
            datasetFill: true,
            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
        },
        initialize: function(data) {
            this.PointClass = Chart.Point.extend({
                strokeWidth: this.options.pointDotStrokeWidth,
                radius: this.options.pointDotRadius,
                display: this.options.pointDot,
                hitDetectionRadius: this.options.pointHitDetectionRadius,
                ctx: this.chart.ctx
            });
            this.datasets = [];
            this.buildScale(data);
            if (this.options.showTooltips) {
                helpers.bindEvents(this, this.options.tooltipEvents, function(evt) {
                    var activePointsCollection = evt.type !== "mouseout" ? this.getPointsAtEvent(evt) : [];
                    this.eachPoints(function(point) {
                        point.restore([ "fillColor", "strokeColor" ]);
                    });
                    helpers.each(activePointsCollection, function(activePoint) {
                        activePoint.fillColor = activePoint.highlightFill;
                        activePoint.strokeColor = activePoint.highlightStroke;
                    });
                    this.showTooltip(activePointsCollection);
                });
            }
            helpers.each(data.datasets, function(dataset) {
                var datasetObject = {
                    label: dataset.label || null,
                    fillColor: dataset.fillColor,
                    strokeColor: dataset.strokeColor,
                    pointColor: dataset.pointColor,
                    pointStrokeColor: dataset.pointStrokeColor,
                    points: []
                };
                this.datasets.push(datasetObject);
                helpers.each(dataset.data, function(dataPoint, index) {
                    var pointPosition;
                    if (!this.scale.animation) {
                        pointPosition = this.scale.getPointPosition(index, this.scale.calculateCenterOffset(dataPoint));
                    }
                    datasetObject.points.push(new this.PointClass({
                        value: dataPoint,
                        label: data.labels[index],
                        datasetLabel: dataset.label,
                        x: this.options.animation ? this.scale.xCenter : pointPosition.x,
                        y: this.options.animation ? this.scale.yCenter : pointPosition.y,
                        strokeColor: dataset.pointStrokeColor,
                        fillColor: dataset.pointColor,
                        highlightFill: dataset.pointHighlightFill || dataset.pointColor,
                        highlightStroke: dataset.pointHighlightStroke || dataset.pointStrokeColor
                    }));
                }, this);
            }, this);
            this.render();
        },
        eachPoints: function(callback) {
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, callback, this);
            }, this);
        },
        getPointsAtEvent: function(evt) {
            var mousePosition = helpers.getRelativePosition(evt), fromCenter = helpers.getAngleFromPoint({
                x: this.scale.xCenter,
                y: this.scale.yCenter
            }, mousePosition);
            var anglePerIndex = Math.PI * 2 / this.scale.valuesCount, pointIndex = Math.round((fromCenter.angle - Math.PI * 1.5) / anglePerIndex), activePointsCollection = [];
            if (pointIndex >= this.scale.valuesCount || pointIndex < 0) {
                pointIndex = 0;
            }
            if (fromCenter.distance <= this.scale.drawingArea) {
                helpers.each(this.datasets, function(dataset) {
                    activePointsCollection.push(dataset.points[pointIndex]);
                });
            }
            return activePointsCollection;
        },
        buildScale: function(data) {
            this.scale = new Chart.RadialScale({
                display: this.options.showScale,
                fontStyle: this.options.scaleFontStyle,
                fontSize: this.options.scaleFontSize,
                fontFamily: this.options.scaleFontFamily,
                fontColor: this.options.scaleFontColor,
                showLabels: this.options.scaleShowLabels,
                showLabelBackdrop: this.options.scaleShowLabelBackdrop,
                backdropColor: this.options.scaleBackdropColor,
                backdropPaddingY: this.options.scaleBackdropPaddingY,
                backdropPaddingX: this.options.scaleBackdropPaddingX,
                lineWidth: this.options.scaleShowLine ? this.options.scaleLineWidth : 0,
                lineColor: this.options.scaleLineColor,
                angleLineColor: this.options.angleLineColor,
                angleLineWidth: this.options.angleShowLineOut ? this.options.angleLineWidth : 0,
                pointLabelFontColor: this.options.pointLabelFontColor,
                pointLabelFontSize: this.options.pointLabelFontSize,
                pointLabelFontFamily: this.options.pointLabelFontFamily,
                pointLabelFontStyle: this.options.pointLabelFontStyle,
                height: this.chart.height,
                width: this.chart.width,
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2,
                ctx: this.chart.ctx,
                templateString: this.options.scaleLabel,
                labels: data.labels,
                valuesCount: data.datasets[0].data.length
            });
            this.scale.setScaleSize();
            this.updateScaleRange(data.datasets);
            this.scale.buildYLabels();
        },
        updateScaleRange: function(datasets) {
            var valuesArray = function() {
                var totalDataArray = [];
                helpers.each(datasets, function(dataset) {
                    if (dataset.data) {
                        totalDataArray = totalDataArray.concat(dataset.data);
                    } else {
                        helpers.each(dataset.points, function(point) {
                            totalDataArray.push(point.value);
                        });
                    }
                });
                return totalDataArray;
            }();
            var scaleSizes = this.options.scaleOverride ? {
                steps: this.options.scaleSteps,
                stepValue: this.options.scaleStepWidth,
                min: this.options.scaleStartValue,
                max: this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
            } : helpers.calculateScaleRange(valuesArray, helpers.min([ this.chart.width, this.chart.height ]) / 2, this.options.scaleFontSize, this.options.scaleBeginAtZero, this.options.scaleIntegersOnly);
            helpers.extend(this.scale, scaleSizes);
        },
        addData: function(valuesArray, label) {
            this.scale.valuesCount++;
            helpers.each(valuesArray, function(value, datasetIndex) {
                var pointPosition = this.scale.getPointPosition(this.scale.valuesCount, this.scale.calculateCenterOffset(value));
                this.datasets[datasetIndex].points.push(new this.PointClass({
                    value: value,
                    label: label,
                    x: pointPosition.x,
                    y: pointPosition.y,
                    strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                    fillColor: this.datasets[datasetIndex].pointColor
                }));
            }, this);
            this.scale.labels.push(label);
            this.reflow();
            this.update();
        },
        removeData: function() {
            this.scale.valuesCount--;
            this.scale.labels.shift();
            helpers.each(this.datasets, function(dataset) {
                dataset.points.shift();
            }, this);
            this.reflow();
            this.update();
        },
        update: function() {
            this.eachPoints(function(point) {
                point.save();
            });
            this.reflow();
            this.render();
        },
        reflow: function() {
            helpers.extend(this.scale, {
                width: this.chart.width,
                height: this.chart.height,
                size: helpers.min([ this.chart.width, this.chart.height ]),
                xCenter: this.chart.width / 2,
                yCenter: this.chart.height / 2
            });
            this.updateScaleRange(this.datasets);
            this.scale.setScaleSize();
            this.scale.buildYLabels();
        },
        draw: function(ease) {
            var easeDecimal = ease || 1, ctx = this.chart.ctx;
            this.clear();
            this.scale.draw();
            helpers.each(this.datasets, function(dataset) {
                helpers.each(dataset.points, function(point, index) {
                    if (point.hasValue()) {
                        point.transition(this.scale.getPointPosition(index, this.scale.calculateCenterOffset(point.value)), easeDecimal);
                    }
                }, this);
                ctx.lineWidth = this.options.datasetStrokeWidth;
                ctx.strokeStyle = dataset.strokeColor;
                ctx.beginPath();
                helpers.each(dataset.points, function(point, index) {
                    if (index === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }, this);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = dataset.fillColor;
                ctx.fill();
                helpers.each(dataset.points, function(point) {
                    if (point.hasValue()) {
                        point.draw();
                    }
                });
            }, this);
        }
    });
}).call(this);

var helpers = Chart.helpers;

Chart.types.Line.extend({
    name: "LineConstant",
    initialize: function(data) {
        Chart.types.Line.prototype.initialize.apply(this, arguments);
        var self = this;
        this.scale.calculateX = function(index) {
            var isRotated = this.xLabelRotation > 0, innerWidth = this.width - (this.xScalePaddingLeft + this.xScalePaddingRight), valueWidth = self.options.stepsCount ? innerWidth / self.options.stepsCount : innerWidth / Math.max(this.valuesCount - (this.offsetGridLines ? 0 : 1), 1), valueOffset = valueWidth * index + this.xScalePaddingLeft;
            if (this.offsetGridLines) {
                valueOffset += valueWidth / 2;
            }
            return Math.round(valueOffset);
        };
        this.scale.calculateY = function(value) {
            if (self.options.scaleLabels) {
                var yLabelGap = (this.endPoint - this.startPoint) / this.steps;
                var yLabelCenter = this.endPoint - yLabelGap * self.options.scaleLabels.indexOf(value);
                return yLabelCenter;
            } else {
                var scalingFactor = this.drawingArea() / (this.min - this.max);
                return this.endPoint - scalingFactor * (value - this.min);
            }
        };
        this.scale.buildYLabels = function() {
            this.yLabels = [];
            if (self.options.scaleLabels) {
                for (var i = 0, len = self.options.scaleLabels.length; i < len; i++) {
                    this.yLabels.push(helpers.template(this.templateString, {
                        value: self.options.scaleLabels[i]
                    }));
                }
            } else {
                for (var i = 0; i <= this.steps; i++) {
                    this.yLabels.push(helpers.template(this.templateString, {
                        value: (this.min + i * this.stepValue).toFixed(stepDecimalPlaces)
                    }));
                }
            }
            this.yLabelWidth = this.display && this.showLabels ? helpers.longestText(this.ctx, this.font, this.yLabels) : 0;
        };
    },
    draw: function(ease) {
        var easingDecimal = ease || 1;
        this.clear();
        var ctx = this.chart.ctx;
        var hasValue = function(item) {
            return item.value !== null;
        }, nextPoint = function(point, collection, index) {
            return helpers.findNextWhere(collection, hasValue, index) || point;
        }, previousPoint = function(point, collection, index) {
            return helpers.findPreviousWhere(collection, hasValue, index) || point;
        };
        this.scale.draw(easingDecimal);
        helpers.each(this.datasets, function(dataset) {
            var pointsWithValues = helpers.where(dataset.points, hasValue);
            helpers.each(dataset.points, function(point, index) {
                if (point.hasValue()) {
                    point.transition({
                        y: this.scale.calculateY(point.value),
                        x: this.scale.calculateX(index)
                    }, easingDecimal);
                }
            }, this);
            ctx.lineWidth = this.options.datasetStrokeWidth;
            ctx.strokeStyle = dataset.strokeColor;
            ctx.beginPath();
            helpers.each(pointsWithValues, function(point, index) {
                if (index === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    if (this.options.constantCurve) {
                        var prevPoint = previousPoint(point, pointsWithValues, index);
                        if (prevPoint && prevPoint.y !== point.y) {
                            ctx.lineTo(point.x, prevPoint.y);
                            ctx.lineTo(point.x, point.y);
                        } else {
                            ctx.lineTo(point.x, point.y);
                        }
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                }
            }, this);
            ctx.stroke();
            if (this.options.datasetFill && pointsWithValues.length > 0) {
                ctx.lineTo(pointsWithValues[pointsWithValues.length - 1].x, this.scale.endPoint);
                ctx.lineTo(pointsWithValues[0].x, this.scale.endPoint);
                ctx.fillStyle = dataset.fillColor;
                ctx.closePath();
                ctx.fill();
            }
            helpers.each(pointsWithValues, function(point) {
                point.draw();
            });
        }, this);
    },
    buildScale: function(labels) {
        var self = this;
        var dataTotal = function() {
            var values = [];
            self.eachPoints(function(point) {
                values.push(point.value);
            });
            return values;
        };
        var scaleOptions = {
            templateString: this.options.scaleLabel,
            height: this.chart.height,
            width: this.chart.width,
            ctx: this.chart.ctx,
            textColor: this.options.scaleFontColor,
            fontSize: this.options.scaleFontSize,
            fontStyle: this.options.scaleFontStyle,
            fontFamily: this.options.scaleFontFamily,
            valuesCount: labels.length,
            beginAtZero: this.options.scaleBeginAtZero,
            integersOnly: this.options.scaleIntegersOnly,
            calculateYRange: function(currentHeight) {
                var updatedRanges = helpers.calculateScaleRange(dataTotal(), currentHeight, this.fontSize, this.beginAtZero, this.integersOnly);
                helpers.extend(this, updatedRanges);
            },
            xLabels: labels,
            font: helpers.fontString(this.options.scaleFontSize, this.options.scaleFontStyle, this.options.scaleFontFamily),
            lineWidth: this.options.scaleLineWidth,
            lineColor: this.options.scaleLineColor,
            showHorizontalLines: this.options.scaleShowHorizontalLines,
            showVerticalLines: this.options.scaleShowVerticalLines,
            gridLineWidth: this.options.scaleShowGridLines ? this.options.scaleGridLineWidth : 0,
            gridLineColor: this.options.scaleShowGridLines ? this.options.scaleGridLineColor : "rgba(0,0,0,0)",
            padding: this.options.showScale ? 0 : this.options.pointDotRadius + this.options.pointDotStrokeWidth,
            showLabels: this.options.scaleShowLabels,
            display: this.options.showScale
        };
        if (this.options.scaleOverride) {
            helpers.extend(scaleOptions, {
                calculateYRange: helpers.noop,
                steps: this.options.scaleSteps,
                stepValue: this.options.scaleStepWidth,
                min: this.options.scaleStartValue,
                max: this.options.scaleLabels ? this.options.scaleLabels[this.options.scaleLabels.length - 1] : this.options.scaleStartValue + this.options.scaleSteps * this.options.scaleStepWidth
            });
        }
        this.scale = new Chart.Scale(scaleOptions);
    },
    addData: function(valuesArray, label) {
        helpers.each(valuesArray, function(value, datasetIndex) {
            this.datasets[datasetIndex].points.push(new this.PointClass({
                value: value,
                label: label,
                x: this.scale.calculateX(this.scale.valuesCount + 1),
                y: this.scale.endPoint,
                strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                fillColor: this.datasets[datasetIndex].pointColor
            }));
        }, this);
        this.scale.addXLabel(label);
    },
    removeData: function() {
        this.scale.removeXLabel();
        helpers.each(this.datasets, function(dataset) {
            dataset.points.shift();
        }, this);
    },
    addDataArray: function(arrayOfValuesArray) {
        for (var i = 0, len = arrayOfValuesArray.length; i < len; ++i) {
            helpers.each(arrayOfValuesArray[i], function(value, datasetIndex) {
                this.datasets[datasetIndex].points.push(new this.PointClass({
                    value: value,
                    label: "",
                    x: this.scale.calculateX(this.scale.valuesCount + 1),
                    y: this.scale.endPoint,
                    strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                    fillColor: this.datasets[datasetIndex].pointColor
                }));
            }, this);
            this.scale.addXLabel("");
        }
    }
});

function LoopTimer(callback, delay) {
    var timerId = null, elapsedTime = 0, startDate = null, timeoutDate = null, remaining = delay, diff = 0, self = this;
    this.start = function() {
        startDate = Date.now();
        elapsedTime = 0;
        this.tick();
    };
    this.tick = function() {
        timeoutDate = Date.now();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(function() {
            elapsedTime += delay;
            diff = Date.now() - startDate - elapsedTime;
            remaining = delay - diff;
            self.tick();
            callback();
        }, remaining);
    };
    this.pause = function() {
        window.clearTimeout(timerId);
        remaining -= Date.now() - timeoutDate;
    };
    this.resume = this.start;
    this.stop = function() {
        window.clearTimeout(timerId);
    };
}

function Events(target) {
    var events = {}, empty = [], list, j, i;
    target = target || this;
    target.on = function(type, func, ctx) {
        (events[type] = events[type] || []).push([ func, ctx ]);
    };
    target.off = function(type, func) {
        type || (events = {});
        list = events[type] || empty, i = list.length = func ? list.length : 0;
        while (i--) func == list[i][0] && list.splice(i, 1);
    };
    target.emit = function(type) {
        list = events[type] || empty;
        i = 0;
        while (j = list[i++]) j[0].apply(j[1], empty.slice.call(arguments, 1));
    };
}

var setTimeWithSeconds = function(sec) {
    var sec_num = parseInt(sec, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ":" + minutes + ":" + seconds;
    return time;
};

var hasClass = function(element, className) {
    return element.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
};

var clearContent = function(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

var PlayerPanel = function(isSubtitleExternDisplay) {
    this.video = null;
    this.playerContainer = null;
    this.controlBarModule = null;
    this.menuModule = null;
    this.menuButton = null;
    this.previousChannel = null;
    this.playPauseButton = null;
    this.nextChannel = null;
    this.panelVolume = null;
    this.volumeButton = null;
    this.volumeOnSvg = null;
    this.volumeOffSvg = null;
    this.sliderVolume = null;
    this.volumeLabel = null;
    this.volumeTimer = null;
    this.fullscreenButton = null;
    this.seekbarContainer = null;
    this.seekbar = null;
    this.seekbarBackground = null;
    this.videoDuration = null;
    this.durationTimeSpan = null;
    this.elapsedTimeSpan = null;
    this.videoQualityButton = null;
    this.qualityModule = null;
    this.closeButton = null;
    this.highBitrateSpan = null;
    this.currentBitrateSpan = null;
    this.lowBitrateSpan = null;
    this.languagesModule = null;
    this.languagesButton = null;
    this.loadingElement = null;
    this.errorModule = null;
    this.titleError = null;
    this.smallErrorMessage = null;
    this.longErrorMessage = null;
    this.barsTimer = null;
    this.hidebarsTimeout = 5e3;
    this.isMute = false;
    this.subtitlesCSSStyle = null;
    this.subTitles = null;
    this.isSubtitleExternDisplay = isSubtitleExternDisplay;
};

PlayerPanel.prototype.init = function() {
    this.video = document.getElementById("player");
    if (this.isSubtitleExternDisplay) {
        this.subTitles = document.createElement("div");
        this.subTitles.setAttribute("id", "subtitleDisplay");
        document.getElementById("VideoModule").appendChild(this.subTitles);
    }
    this.playerContainer = document.getElementById("demo-player-container");
    this.controlBarModule = document.getElementById("ControlBarModule");
    this.menuModule = document.getElementById("MenuModule");
    this.menuButton = document.getElementById("menuButton");
    this.previousChannel = document.getElementById("previousChannel");
    this.playPauseButton = document.getElementById("button-playpause");
    this.nextChannel = document.getElementById("nextChannel");
    this.panelVolume = document.getElementById("panel-volume");
    this.volumeButton = document.getElementById("button-volume");
    this.volumeOnSvg = document.getElementById("volumeOn");
    this.volumeOffSvg = document.getElementById("volumeOff");
    this.sliderVolume = document.getElementById("slider-volume");
    this.volumeLabel = document.getElementById("volumeLabel");
    this.fullscreenButton = document.getElementById("button-fullscreen");
    this.seekbarContainer = document.querySelector(".bar-container");
    this.seekbar = document.querySelector(".bar-seek");
    this.seekbarBackground = document.querySelector(".bar-background");
    this.durationTimeSpan = document.querySelector(".op-seek-bar-time-remaining span");
    this.elapsedTimeSpan = document.querySelector(".op-seek-bar-time-elapsed span");
    this.videoQualityButton = document.getElementById("videoQualityButton");
    this.qualityModule = document.getElementById("QualityModule");
    this.closeButton = document.getElementById("CloseCrossModule");
    this.highBitrateSpan = document.getElementById("highBitrateSpan");
    this.currentBitrateSpan = document.getElementById("bandwith-binding");
    this.lowBitrateSpan = document.getElementById("lowBitrateSpan");
    this.languagesModule = document.getElementById("LanguagesModule");
    this.languagesButton = document.getElementById("languagesButton");
    this.loadingElement = document.getElementById("LoadingModule");
    this.errorModule = document.getElementById("ErrorModule");
    this.titleError = document.getElementById("titleError");
    this.smallErrorMessage = document.getElementById("smallMessageError");
    this.longErrorMessage = document.getElementById("longMessageError");
    this.setupEventListeners();
};

PlayerPanel.prototype.setupEventListeners = function() {
    this.playerContainer.addEventListener("webkitfullscreenchange", this.onFullScreenChange.bind(this));
    this.playerContainer.addEventListener("mozfullscreenchange", this.onFullScreenChange.bind(this));
    this.playerContainer.addEventListener("fullscreenchange", this.onFullScreenChange.bind(this));
    this.playerContainer.addEventListener("mouseenter", this.showBarsTimed.bind(this));
    this.playerContainer.addEventListener("mousemove", this.showBarsTimed.bind(this));
    this.playerContainer.addEventListener("click", this.showBarsTimed.bind(this));
    this.volumeButton.addEventListener("click", this.onMuteEnter.bind(this));
    this.volumeButton.addEventListener("mouseenter", this.onMuteEnter.bind(this));
    this.panelVolume.addEventListener("mouseover", this.onPanelVolumeEnter.bind(this));
    this.panelVolume.addEventListener("mouseout", this.onPanelVolumeOut.bind(this));
    this.fullscreenButton.addEventListener("click", this.onFullScreenClicked.bind(this));
    this.sliderVolume.addEventListener("change", this.onSliderVolumeChange.bind(this));
    this.videoQualityButton.addEventListener("click", this.onVideoQualityClicked.bind(this));
    this.playPauseButton.addEventListener("click", this.onPlayPauseClicked.bind(this));
    this.video.addEventListener("dblclick", this.onFullScreenClicked.bind(this));
    this.video.addEventListener("ended", this.onVideoEnded.bind(this));
    this.previousChannel.addEventListener("click", this.onPreviousClicked.bind(this));
    this.nextChannel.addEventListener("click", this.onNextChannelClicked.bind(this));
    this.seekbarContainer.addEventListener("mouseenter", this.onSeekBarModuleEnter.bind(this));
    this.seekbarContainer.addEventListener("mouseleave", this.onSeekBarModuleLeave.bind(this));
    this.seekbarBackground.addEventListener("click", this.onSeekClicked.bind(this));
    this.seekbar.addEventListener("click", this.onSeekClicked.bind(this));
    this.menuButton.addEventListener("click", this.onMenuClicked.bind(this));
    this.languagesButton.addEventListener("click", this.onLanguagesClicked.bind(this));
    this.closeButton.addEventListener("click", this.onCloseButtonClicked.bind(this));
    this.video.addEventListener("waiting", this.onWaiting.bind(this));
    this.video.addEventListener("playing", this.onPlaying.bind(this));
};

PlayerPanel.prototype.onFullScreenChange = function(e) {
    var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    if (!state) {
        document.getElementById("demo-player-container").className = "demo-player";
    }
};

PlayerPanel.prototype.onMenuClicked = function() {
    if (hasClass(this.menuModule, "op-hidden-translate-up")) {
        this.menuModule.className = "op-menu op-show-translate-up";
    } else {
        this.menuModule.className = "op-menu op-hidden-translate-up";
    }
};

PlayerPanel.prototype.onMuteEnter = function() {
    this.showVolumePanel();
    this.restartVolumeTimer();
};

PlayerPanel.prototype.restartVolumeTimer = function() {
    var self = this;
    clearTimeout(this.volumeTimer);
    this.volumeTimer = setTimeout(function() {
        self.hideVolumePanel();
    }, 3e3);
};

PlayerPanel.prototype.onPanelVolumeEnter = function() {
    this.stopVolumeTimer();
};

PlayerPanel.prototype.onPanelVolumeOut = function() {
    this.restartVolumeTimer();
};

PlayerPanel.prototype.stopVolumeTimer = function() {
    clearTimeout(this.volumeTimer);
};

PlayerPanel.prototype.onMuteClicked = function() {
    setPlayerMute();
    this.setVolumeOff(orangeHasPlayer.getMute());
    this.hideVolumePanel();
};

PlayerPanel.prototype.showVolumePanel = function() {
    this.panelVolume.className = "op-container-volume";
};

PlayerPanel.prototype.hideVolumePanel = function() {
    clearTimeout(this.volumeTimer);
    this.panelVolume.className = "op-container-volume op-hidden";
};

PlayerPanel.prototype.onSliderVolumeChange = function() {
    if (this.sliderVolume.value === "0") {
        this.onMuteClicked();
        this.isMute = true;
    } else if (this.isMute) {
        this.onMuteClicked();
        this.isMute = false;
    }
    setPlayerVolume(parseInt(this.sliderVolume.value, 10) / 100);
};

PlayerPanel.prototype.onVideoQualityClicked = function() {
    if (!hasClass(this.languagesModule, "op-hidden")) {
        this.languagesModule.className = "op-screen op-languages op-hidden";
    }
    if (hasClass(this.qualityModule, "op-hidden")) {
        this.qualityModule.className = "op-screen op-settings-quality";
        this.hideControlBar();
        this.enableMiddleContainer(true);
        clearTimeout(this.barsTimer);
    } else {
        this.qualityModule.className = "op-screen op-settings-quality op-hidden";
        this.showControlBar();
        this.enableMiddleContainer(false);
        this.showBarsTimed();
    }
};

PlayerPanel.prototype.setCurrentBitrate = function(bitrate) {
    this.currentBitrateSpan.innerHTML = bitrate / 1e6;
};

PlayerPanel.prototype.onPreviousClicked = function() {
    minivents.emit("play-prev-stream");
};

PlayerPanel.prototype.onPlayPauseClicked = function(e) {
    changePlayerState();
};

PlayerPanel.prototype.onNextChannelClicked = function() {
    minivents.emit("play-next-stream");
};

PlayerPanel.prototype.onSeekBarModuleEnter = function(e) {
    this.seekbar.className = "bar-seek bar-seek-zoom";
    this.seekbarBackground.className = "bar-background bar-seek-zoom";
};

PlayerPanel.prototype.onSeekBarModuleLeave = function(e) {
    this.seekbar.className = "bar-seek";
    this.seekbarBackground.className = "bar-background";
};

PlayerPanel.prototype.onSeekClicked = function(e) {
    if (!this.videoDuration) {
        return;
    }
    if (this.videoDuration !== Infinity) {
        setSeekValue(e.offsetX * this.videoDuration / this.seekbarBackground.clientWidth);
    } else {
        var range = orangeHasPlayer.getDVRWindowRange(), progress = e.offsetX / this.seekbarBackground.clientWidth, duration = range.end - range.start, seekTime = range.start + duration * progress;
        setSeekValue(seekTime);
    }
};

PlayerPanel.prototype.setPlaying = function(value) {
    if (value) {
        this.playPauseButton.className = "tooltip op-play op-pause stop-anchor";
        this.playPauseButton.title = "Pause";
    } else {
        this.playPauseButton.className = "tooltip op-play stop-anchor";
        this.playPauseButton.title = "Play";
    }
};

PlayerPanel.prototype.setDuration = function(duration) {
    this.videoDuration = duration;
    if (duration !== Infinity) {
        this.durationTimeSpan.textContent = setTimeWithSeconds(duration);
    } else {
        this.durationTimeSpan.textContent = "00:00:00";
        this.setPlayingTime(0);
    }
};

PlayerPanel.prototype.setPlayingTime = function(time) {
    var progress;
    this.elapsedTimeSpan.textContent = setTimeWithSeconds(time);
    if (this.videoDuration !== Infinity) {
        progress = time / this.videoDuration * 100;
        this.seekbar.style.width = progress + "%";
    } else {
        var range = orangeHasPlayer.getDVRWindowRange();
        if (range !== null && time > 0) {
            this.durationTimeSpan.textContent = setTimeWithSeconds(range.end);
            progress = (time - range.start) / (range.end - range.start) * 100;
            this.seekbar.style.width = progress + "%";
        }
    }
};

PlayerPanel.prototype.setVolumeOff = function(value) {
    if (value) {
        this.volumeOffSvg.style.display = "block";
        this.volumeOnSvg.style.display = "none";
    } else {
        this.volumeOffSvg.style.display = "none";
        this.volumeOnSvg.style.display = "block";
    }
};

PlayerPanel.prototype.onVolumeChange = function(volumeLevel) {
    var sliderValue = parseInt(this.sliderVolume.value, 10);
    this.volumeLabel.innerHTML = Math.round(volumeLevel * 100);
    if (sliderValue === 0) {
        this.sliderVolume.className = "op-volume";
    } else if (sliderValue > 0 && sliderValue <= 8) {
        this.sliderVolume.className = "op-volume op-range8";
    } else if (sliderValue > 8 && sliderValue <= 16) {
        this.sliderVolume.className = "op-volume op-range16";
    } else if (sliderValue >= 16 && sliderValue <= 24) {
        this.sliderVolume.className = "op-volume op-range24";
    } else if (sliderValue >= 24 && sliderValue <= 32) {
        this.sliderVolume.className = "op-volume op-range32";
    } else if (sliderValue >= 32 && sliderValue <= 40) {
        this.sliderVolume.className = "op-volume op-range40";
    } else if (sliderValue >= 40 && sliderValue <= 48) {
        this.sliderVolume.className = "op-volume op-range48";
    } else if (sliderValue >= 48 && sliderValue <= 56) {
        this.sliderVolume.className = "op-volume op-range56";
    } else if (sliderValue >= 56 && sliderValue <= 64) {
        this.sliderVolume.className = "op-volume op-range64";
    } else if (sliderValue >= 64 && sliderValue <= 72) {
        this.sliderVolume.className = "op-volume op-range72";
    } else if (sliderValue >= 72 && sliderValue <= 80) {
        this.sliderVolume.className = "op-volume op-range80";
    } else if (sliderValue >= 80 && sliderValue <= 88) {
        this.sliderVolume.className = "op-volume op-range88";
    } else if (sliderValue >= 88 && sliderValue <= 96) {
        this.sliderVolume.className = "op-volume op-range96";
    } else if (sliderValue >= 96) {
        this.sliderVolume.className = "op-volume op-range100";
    }
};

PlayerPanel.prototype.onVideoEnded = function(e) {
    minivents.emit("video-ended");
};

PlayerPanel.prototype.showLoadingElement = function() {
    if (orangeHasPlayer.getTrickModeSpeed() === 1) {
        this.loadingElement.className = "op-loading";
    }
};

PlayerPanel.prototype.hideLoadingElement = function() {
    this.loadingElement.className = "op-loading op-none";
};

PlayerPanel.prototype.onWaiting = function() {
    this.showLoadingElement();
};

PlayerPanel.prototype.onPlaying = function() {
    this.hideLoadingElement();
};

PlayerPanel.prototype.hideControlBar = function() {
    this.controlBarModule.className = "op-control-bar op-none";
};

PlayerPanel.prototype.showControlBar = function() {
    this.controlBarModule.className = "op-control-bar";
};

PlayerPanel.prototype.showErrorModule = function() {
    this.errorModule.className = "op-error";
};

PlayerPanel.prototype.hideErrorModule = function() {
    this.errorModule.className = "op-error op-hidden";
};

PlayerPanel.prototype.hideBars = function() {
    this.controlBarModule.className = "op-control-bar op-fade-out";
    this.menuModule.className = "op-menu op-hidden-translate-up";
    this.languagesModule.className = "op-screen op-languages op-hidden";
    this.qualityModule.className = "op-screen op-settings-quality op-hidden";
    this.enableMiddleContainer(false);
    this.closeButton.className = "op-close op-hidden";
};

PlayerPanel.prototype.showBarsTimed = function(e) {
    if (hasClass(document.querySelector(".op-middle-container"), "disabled")) {
        var self = this;
        clearTimeout(this.barsTimer);
        this.barsTimer = setTimeout(function() {
            self.hideBars();
        }, self.hidebarsTimeout);
        this.controlBarModule.className = "op-control-bar";
    }
};

PlayerPanel.prototype.onFullScreenClicked = function() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (this.playerContainer.requestFullscreen) {
            this.playerContainer.requestFullscreen();
        } else if (this.playerContainer.msRequestFullscreen) {
            this.playerContainer.msRequestFullscreen();
        } else if (this.playerContainer.mozRequestFullScreen) {
            this.playerContainer.mozRequestFullScreen();
        } else if (this.playerContainer.webkitRequestFullscreen) {
            this.playerContainer.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        document.getElementById("demo-player-container").className = "demo-player-fullscreen";
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        document.getElementById("demo-player-container").className = "demo-player";
    }
    this.applySubtitlesCSSStyle(this.subtitlesCSSStyle);
};

PlayerPanel.prototype.resetSeekbar = function() {
    this.seekbar.style.width = 0;
    this.durationTimeSpan.textContent = "00:00:00";
    this.elapsedTimeSpan.textContent = "00:00:00";
};

PlayerPanel.prototype.applySubtitlesCSSStyle = function(style) {
    var fontSize;
    if (!this.isSubtitleExternDisplay) {
        document.getElementById("cueStyle").innerHTML = "::cue{ background-color:" + style.backgroundColor + ";color:" + style.color + ";font-size: " + fontSize + "px;font-family: " + style.fontFamily + "}";
    } else {
        this.subTitles.style.bottom = this.controlBarModule.clientHeight + this.video.videoHeight * .05 + "px";
        if (style) {
            fontSize = style.fontSize;
            if (style.fontSize && style.fontSize[style.fontSize.length - 1] === "%") {
                fontSize = this.video.clientHeight * style.fontSize.substr(0, style.fontSize.length - 1) / 100;
            }
            this.subTitles.style.position = "absolute";
            this.subTitles.style.display = "block";
            this.subTitles.style.textAlign = "center";
            this.subTitles.style.padding = "10px";
            this.subTitles.style.backgroundColor = style.backgroundColor;
            this.subTitles.style.color = style.color;
            this.subTitles.style.fontSize = fontSize + "px";
            this.subTitles.style.fontFamily = style.fontFamily;
        }
    }
};

PlayerPanel.prototype.enterSubtitle = function(subtitleData) {
    var style = subtitleData.style;
    this.subtitlesCSSStyle = style;
    this.applySubtitlesCSSStyle(style);
    if (this.isSubtitleExternDisplay && subtitleData.text) {
        this.subTitles.innerText = subtitleData.text;
        this.subTitles.style.left = this.video.clientWidth / 2 - this.subTitles.clientWidth / 2 + "px";
    }
};

PlayerPanel.prototype.cleanSubtitlesDiv = function() {
    if (this.isSubtitleExternDisplay) {
        this.subTitles.innerText = "";
        this.subTitles.style.backgroundColor = "rgba(0,0,0,0)";
    }
};

PlayerPanel.prototype.exitSubtitle = function(subtitleData) {
    this.cleanSubtitlesDiv();
};

PlayerPanel.prototype.onLanguagesClicked = function() {
    if (!hasClass(this.qualityModule, "op-hidden")) {
        this.qualityModule.className = "op-screen op-settings-quality op-hidden";
    }
    if (hasClass(this.languagesModule, "op-hidden")) {
        this.languagesModule.className = "op-screen op-languages";
        this.hideControlBar();
        this.enableMiddleContainer(true);
        clearTimeout(this.barsTimer);
    } else {
        this.languagesModule.className = "op-screen op-languages op-hidden";
        this.showControlBar();
        this.enableMiddleContainer(false);
        this.showBarsTimed();
    }
};

PlayerPanel.prototype.onCloseButtonClicked = function() {
    this.languagesModule.className = "op-screen op-languages op-hidden";
    this.qualityModule.className = "op-screen op-settings-quality op-hidden";
    this.enableMiddleContainer(false);
    this.closeButton.className = "op-close op-hidden";
    this.showControlBar();
};

PlayerPanel.prototype.enableMiddleContainer = function(enabled) {
    if (enabled) {
        document.querySelector(".op-middle-container").className = "op-middle-container";
        this.closeButton.className = "op-close";
    } else {
        document.querySelector(".op-middle-container").className = "op-middle-container disabled";
        this.closeButton.className = "op-close op-hidden";
    }
};

PlayerPanel.prototype.createLanguageLine = function(audioTrack, selectedAudioTrack, type) {
    var checked = selectedAudioTrack.id === audioTrack.id ? 'checked="checked"' : "", lang = audioTrack.lang !== undefined ? audioTrack.lang : audioTrack.id, html = '<div class="op-languages-line">' + '<input type="radio" name="' + type + '" id="' + audioTrack.id + '" value="' + audioTrack.id + '" ' + checked + " >" + '<label for="' + audioTrack.id + '">' + '<span class="op-radio">' + '<svg version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve"><g id="Calque_3" display="none">	<rect x="-0.1" display="inline" fill="none" width="32" height="32"></rect></g><g id="Calque_1_1_"><g><g><circle fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" cx="15.9" cy="16" r="13"></circle></g></g></g></svg>' + "</span>" + '<span class="op-radiocheck">' + '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" xml:space="preserve"><g id="Calque_3" display="none">	<rect x="-0.1" y="0" display="inline" fill="none" width="32" height="32"></rect></g><g id="Calque_1">	<g>		<g>			<circle fill="none" stroke="#000000" stroke-width="2" stroke-miterlimit="10" cx="15.9" cy="16" r="13"></circle></g></g></g><g id="Calque_2">	<path fill-rule="evenodd" clip-rule="evenodd" d="M15.9,7.9c4.5,0,8.1,3.6,8.1,8.1s-3.6,8.1-8.1,8.1c-4.5,0-8.1-3.6-8.1-8.1		S11.5,7.9,15.9,7.9z"></path></g></svg>' + "</span>" + "<span> " + lang + "</span>" + "</label>" + "</div>";
    return html;
};

PlayerPanel.prototype.addLanguageLine = function(audioTrack, selectedAudioTrack) {
    var html = this.createLanguageLine(audioTrack, selectedAudioTrack, "language"), languageContainer = document.querySelector(".op-summary");
    languageContainer.insertAdjacentHTML("beforeend", html);
    document.getElementById(audioTrack.id).addEventListener("click", this.onLanguageRadioClicked.bind(this));
};

PlayerPanel.prototype.addSubtitleLine = function(subtitleTrack, selectedSubtitleTrack) {
    var html = this.createLanguageLine(subtitleTrack, selectedSubtitleTrack, "subtitle"), subtitleContainer = document.querySelector(".op-panel-container");
    subtitleContainer.insertAdjacentHTML("beforeend", html);
    document.getElementById(subtitleTrack.id).addEventListener("click", this.onSubtitleRadioClicked.bind(this));
};

PlayerPanel.prototype.updateAudioData = function(_audioTracks, _currenTrack) {
    var i = 0;
    if (_audioTracks && _currenTrack) {
        for (i = 0; i < _audioTracks.length; i += 1) {
            this.addLanguageLine(_audioTracks[i], _currenTrack);
        }
    }
};

PlayerPanel.prototype.updateSubtitleData = function(_subtitleTracks, _selectedSubtitleTrack) {
    var i = 0;
    if (_subtitleTracks && _selectedSubtitleTrack) {
        for (i = 0; i < _subtitleTracks.length; i += 1) {
            this.addSubtitleLine(_subtitleTracks[i], _selectedSubtitleTrack);
        }
    }
};

PlayerPanel.prototype.onLanguageRadioClicked = function(e) {
    minivents.emit("language-radio-clicked", e.target.value);
};

PlayerPanel.prototype.onSubtitleRadioClicked = function(e) {
    minivents.emit("subtitle-radio-clicked", e.target.value);
};

PlayerPanel.prototype.displayError = function(code, message) {
    this.titleError.innerHTML = code;
    this.smallErrorMessage.innerHTML = message;
    this.showErrorModule();
};

PlayerPanel.prototype.resetLanguageLines = function() {
    var languageLines = document.getElementsByClassName("op-languages-line");
    if (languageLines !== null) {
        while (languageLines.length > 0) {
            languageLines[0].removeEventListener("click", this.onLanguageRadioClicked.bind(this));
            languageLines[0].parentNode.removeChild(languageLines[0]);
        }
    }
};

PlayerPanel.prototype.reset = function() {
    this.resetSeekbar();
    this.resetLanguageLines();
    this.hideErrorModule();
    this.showBarsTimed();
    this.cleanSubtitlesDiv();
};

var StreamsPanel = function() {
    this.selectedStreamElement = null;
    this.streamFilters = {
        vod: true,
        live: true,
        hls: true,
        mss: true,
        dash: true
    };
    this.live_icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAABZCAMAAADPVGA0AAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAsRQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////JmmGNgAAAOt0Uk5TAAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISktMTU5PUFFSU1RVVldYWVpbXF1eX2FiY2RlZ2hqbW5vcHFyc3R1dnd4ent8fX+AgYKDhIaHiImKi4yNjo+QkZKUlZaXmJmam5ydnp+goaSlpqeoqausra6vsLGztLW3ubq7vL2+v8DBwsPExcbIycrLzM3Oz9DR09TV1tfY2drb3N3e4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/kyX6S8AAAcGSURBVGjetVr7Y09lGD9f0zab2UW2YmQ2mUsjm5BQWpRIConNpVzCrBCSiq4qSVSUQobcysy1KzbZ3OWSO7Obbd5/ou277X0+57zPOXOOc96fzvd5Puf9fN9znvPc3lfTjKPF1haaJyP613b1g8IPiAJP+KMPitOt6wM12imEJ/wxedUT32sNClgnhCf80bn+iXcFW6K+FsIT/vsO1U68ymeBGi/qRkGsB2uvHpPMUR2KJEocifWEXZR2MUOF5BFKFHZ1j77TZZg4v7EJajmAbvV38+F3uwFT/8BjRgCk8iV3TS/1Fkyexvqb84CY7PaHNxYmv9KMASwCwFfuu53PYPqlqrpjOanzQtynD/oLXm03o9aXTdqSJC98fjyY3+8NDMo0eDbjvIl46UAxRq9qeJxUG3SaNvtaO+WL2f2Q7vePxHFW7/tHgVtKQMX9x8WJOMcx7t8HdI7/OrG8qnvzB0kxBxVNqg3GGb8/wuZFoWgGsRwLAPmzJD+BVu/LqpE54G9+2H/rVjSywMPE8yLId5N4MM6RUfef4hytvXrMROkA4vmDpD1Iuh/jcUqZcMgv2UX5oyjfRUz9pHAJCUdg4nUU3lUrW08+n+48GQaKQST/Xr6SS8TSELBvwYd6uYMd+rYX4Nb3eRsvqgu8Q/jvoU0JyYt72Xv4yYV0b1k73veMrBWtoViE3mAjIW8Ptmt6T1fS3ZvR+M8Y3Vt4sZR8iSkCPL8P7X947wrOyjTtA8poarLulwnXG3BZJP4t0D59QzDyLSDvSuLxfsEycjngIxLp6ZU7ioDxpUSEeSO5nlX+3/R5zWcy/qrxsTOf/54wENWMuRR3qn+2JFQKgULJdC80MZk/qn/6GzPSBzQ1UTcmKyuNhGye+BJ0kf5aABsC32QnD8vIqajRV+zM5P9gBptC+M7rpMvZQL9JSm9yqwuedhEsW1zKbMSAQsmdbQPxaildUfWLKpDpBImkzO9TZuKOWJD4xz9Jlm+/Ioakk6T0qKY1KOHsczBNnKxO2/e6UEZhqopLJPVwkiZRyhmsxZFzBH//EdWaTM1SKJhR8piKPCC1i0nYgHLO9hCCD8F9lBW/rRaM5wQ7rqhBcRbl7uzkg7TJ8joLjIZ8zhPKnGuFydigQHtS1IjiUs7pUH0sJEAX+mIVk065bUYv+hqx99yUuh4knQ8xZoO8foUAw6Rwr7KirabsIkcBZ3N1ZToEgx3y+ikCzJbCb40TtjRffI0b042lnA31lsJ9YAfdOYc/yzjhRAt2McWIni5V35GwMxhkgbyGdGqNkpLIsd6KfpMRPVSqNkIaJYWnNPqK4LvZLIUDjRPmWdErTiJVqrIhDaZvVSMXEsXl/YoxX7aiLzSie3B5fQhlElqFvG7EOYZHjIV4pRW9MKZFSZxT8xHe9uovWbHfsLn6W7bf/UEr+nzb796u5WfZsvwXOMuPpwrI9nc/wYpeaYhlStVK/rvPtvZ6K5TyzcrrxZt7vXm817Pt87eYs+9QwDvq8/lsxKPHU6b02JLNl9/TiA0s4l4tRbwl9cb7fsqKVpuxr1egvSjeR3LxPsMk2/mTLT1qs52zPPuF5gqUbCjXJNtxkOulsLkeV4OTk/iczfUSMdNNvtNMt881xuE9yfTxST2MM6zKIJM8P8I6z2+v+L68TgxsAeX50SSdjHk+VDngmLSfraucoNf+Q/KLU7kdqrCrbIm9VpdKjabnBy9/JM09my8gp2yvfULl2dPCWEgm28P10R8fq69woc8dQvZxMdykhI1IHZ35elpqpIk6jL6Q0gjWIOL19f07/MbOImf1/UKmiVY15unre+hunITuRjvyPBWdnbAnQHfjYZAXGLJP6O30Adg6aIAGOejt7ObjcIqx6G9SzG6yAM5Je2UB3P64xjm0sqZGJ341mE+pbz9vl31gJb/4wLNKiHiOkBMA2arIeVcT/XLZg/yG2gi1p3sce7pz3OnpLsBEmcqEm6F1wi8Ii7uXwUfc6GifQJ8E7WPKvrqT8AD285Nd7+fvEVzjABqgQxA9tY7d9m6W5J+B0megUYt2Ct1/3V7OOofsci9ni24vB97JUKSBHc656k6Wo508//pzdQFhJhQkun1MCHClbVHRrMAhu5//tM5gYwuN3ey6EXBMsGG/qhjf63wXMyfRLEc9Y3Dj4Pgx4XdzjLE4QeDb7vUOdgLsYO9Rjs90gOMN+WEe7N//Dfv3Kar+E3g2y92nXwzTL2H04eesWlR3O8Zh95U9uTUcT66MdJe9PxzNEKN4zDI8tzPATXbduZ1vTEAhuV6dWrqCGw+hZjA8s+XmmbU7O7OFBuLuibloKsomWuGWeX1eb6UlLOAnr04r1qx/Zz0pu7dnNQ83rQ8Wvt+7k6qn7iB4xm7z6JxuzC9K3037HzwvOCZDH5EAAAAAAElFTkSuQmCC";
    this.vod_icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIkAAABoCAMAAADy4iPcAAAAA3NCSVQICAjb4U/gAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAo5QTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////gqK45QAAANl0Uk5TAAECAwQFBgcICgsNDg8QERITFBUXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ2Nzg5Ojw+P0BBQkRFRkdISUxNTlBRUlNUVVZYWVxdXl9gYmNkZWZnaGlrbG1ub3JzdHV2d3l6e3x9fn+AgYKDhIWGh4iJioyNjo+QkZKTlZaXmJmanJ6foKKkpaanqKmqq6ytrq+wsbO0t7q7vL7AwsXGyMnKy8zNz9DR0tPU1dbX2drb3N3e4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/iBuvXoAAASuSURBVGje7Zr7V1RVFMc/MjkExUMITC20RMowtDKpbOipaaOBlTX4ICmcKDNTacqEpIc9SSUrg8rMHhChiaUIiqb2pIJBoOb8N/1w57WHmbu810UrW+f8tM/+zrn3c+fcu+/ee13Uf2WgSTSJJjnfSdxut7tSuPrcYgwKcaXQDgqtVmjNQmsWWp3QOtxut9sNwHQh/IoYfiFOEdpeoS0W2gtC2yS0+4T2WUTQJJpEk2gSTaJJ/i0Sn8/ne10IAz4xhoX4qtB6hNYktBahtQitSWjHfD6fz6czJU2iSTSJJtEk5xFJ4EDDZu/yp+p3nRglkseA9IGR/g6A98LTo4+OD7/oZ9b3i5/2hJUxGZddU7LyzcO2SDoAto/0VwFZoZLd73WKpCO3MT5JaBSs/9HG7swGbh/hHc4FVgUn3dcGz3BBRuhcniEzEkhZ67dMshVwHI/1fgTQbthdkwAc7p2nAmroSP0NACwYkiRlXq/X6y1fXJIVZJlxxCpJbwrwbKz3XmCmYf5eADCrLay9nQVQIUm+DE87t+QDMP6Q1WenFJgW4/s5Gag37PsBbo3+szuyAT5MQKJUYFsaQEGfRZI9AF9IXz2Q/EskCZ4hD9rmBC71JyJRqvMKgEqLJIE8oFz6ZgGLDPMmwNEas+ZJgNrEJOrbVMB51GJkWweki1t9P8DHxiEBlsYuGcgBrgwkJlG1AI9bJOlOArZFeyqBCX8ppZRaE+80SnkB2kxI/swAJluN9q6YkDJ0CVBt2HOB/AQBsc6ERFUAHLJI0gAkHYuqqwC+M6BS4m2OUoFxgNuM5F1i/+mzIPGnAzWR+T1AsWG2A7wcZ00JkGdGchzgaavv4mViC35yAm8Y9m6A3XGWrABSzUhUMvCIVZKvREipA1L/MOwdAK1xljwBcMaMJAcotZyfTAc8oUkR8EDQfgXg+zgrngf4wYxkGnCnZZJNQFp/VDDZG00S7wl4DuCkGclU4C7LJKfHRm70VcDkYNBSjYl2pxpg0IwkG1hiPXucD9xmPLfZwIaQ/xOAT23dsc6oDMcCSVM4pOwCHOG+zTdmT/HlZiRdAM9YJxnOBTYqpdQ84I5IuDWLbIvMSN6RifDZ5/ZVwNRA8I7ZEfHfYjfalwN02yA5CPC5UpuBzIGY97+NN+BvFwFX2ap3ZgMPK1UIrIhy7wN40HpWUAOw3hbJViDN3wbwdbS/GHC0WM2UWi8EUk7ZIulNARoqgMKRyaXV7LFjEsBam9VoKXDzuKhrDY4ygLnRZd+BbIAPEmbUw6+lAlx3xibJnmCh4oyp33rzAYrCWxZ4KxNgeYIqY7i9ZiIAU3rsVuiBPINkQazQOQHAsbDx5N9q8PCL1wMwb1CSzPd4PB5P2d1zUoMXVHzCfq9gnXGI5hFCV2GoGk0PVZtLB82r0cy64XPoWnQnAeTGOUR/1VhxnpztphX6mDkv9Z1b/8QFsDo+ZWWka1G0JVHX4uKJV9+4sPr906PfyVm9bM3odXJ0n02TaBJNokk0yf+exOVyuR6SbTmXGDLvXCK0/ULbIDRZ6e0U2kah7XO5XC6X/upDk2gSTaJJNIn+xi/UuNPf+GkSTaJJ7Ix/AM0hoKaSUmWoAAAAAElFTkSuQmCC";
};

StreamsPanel.prototype.init = function() {
    this.initStreamListFilter();
    this.loadStreamList();
    this.setupEventListeners();
};

StreamsPanel.prototype.setupEventListeners = function() {
    minivents.on("play-prev-stream", this.onPlayPreviousStream.bind(this));
    minivents.on("play-next-stream", this.onPlayNextStream.bind(this));
};

StreamsPanel.prototype.initStreamTable = function() {
    var tableNode = document.getElementById("streams-table");
    if (tableNode) {
        clearContent(tableNode);
    } else {
        tableNode = document.createElement("table");
        tableNode.id = "streams-table";
        document.getElementById("streams-container").appendChild(tableNode);
    }
    return tableNode;
};

StreamsPanel.prototype.buildStreamsList = function(streamsList) {
    var tableNode = this.initStreamTable();
    for (var i = 0, len = streamsList.items.length; i < len; i++) {
        var stream = streamsList.items[i];
        if (stream.protocol) {
            var streamItem = this.createStreamEntry(stream);
            tableNode.appendChild(streamItem);
        }
    }
    this.loadTVMConfig();
};

StreamsPanel.prototype.loadTVMConfig = function() {
    if (!window.TVM_SOURCES_CONFIG) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", document.location.pathname + "/../json/tvm_sources_config.json");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                window.TVM_SOURCES_CONFIG = JSON.parse(xhr.responseText);
                this.loadTVMSources();
            }
        }.bind(this);
        xhr.send();
    } else {
        this.loadTVMSources();
    }
};

StreamsPanel.prototype.loadTVMSources = function() {
    var channels = window.TVM_SOURCES_CONFIG.channels;
    for (var i = 0; i < channels.length; i++) {
        this.appendTVMSource(channels[i]);
    }
};

StreamsPanel.prototype.loadTVMSource = function(stream, callback) {
    var self = this;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", stream.tvmUrl);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var source = JSON.parse(xhr.responseText);
            if (!source.error) {
                callback(self._formatTVMResponse(source.response, stream));
            } else {
                if (source.error && source.error.code === "PFS_AUTH") {
                    window.open(source.error.param, "_blank");
                }
            }
        }
    }.bind(this);
    xhr.send();
};

StreamsPanel.prototype._formatTVMData = function(channelId, channelName) {
    var formattedSource = {
        type: "Live",
        protocol: "MSS",
        name: channelId + " - " + channelName + " G8PC QUALIF",
        tvmUrl: window.TVM_SOURCES_CONFIG.server + "channels/" + channelId + "/url",
        browsers: "cdsbi"
    };
    return formattedSource;
};

StreamsPanel.prototype._formatTVMResponse = function(response, formattedSource) {
    if (!Array.prototype.find) {
        var find = function(predicate) {
            if (this === null) {
                throw new TypeError("Array.prototype.find a été appelé sur null ou undefined");
            }
            if (typeof predicate !== "function") {
                throw new TypeError("predicate doit être une fonction");
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;
            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        };
        Object.defineProperty(Array.prototype, "find", {
            value: find,
            enumerable: false
        });
    }
    formattedSource.url = response.url;
    if (response.protectionData.length > 0) {
        var protDataWV = response.protectionData.find(function(element) {
            return element.keySystem === "com.widevine.alpha";
        });
        var protDataPR = response.protectionData.find(function(element) {
            return element.keySystem === "com.microsoft.playready";
        });
        formattedSource.protData = {
            "com.widevine.alpha": {
                laURL: protDataWV ? protDataWV.laUrl : "",
                withCredentials: true
            },
            "com.microsoft.playready": {
                laURL: protDataPR ? protDataPR.laUrl : "",
                withCredentials: true
            }
        };
    }
    return formattedSource;
};

StreamsPanel.prototype.appendTVMSource = function(channel) {
    var tableNode = document.getElementById("streams-table");
    var stream = this._formatTVMData(channel.id, channel.name);
    var streamItem = this.createStreamEntry(stream);
    tableNode.appendChild(streamItem);
};

StreamsPanel.prototype.createStreamEntry = function(stream) {
    var streamItem = document.createElement("tr"), streamItemName = document.createElement("td"), streamItemProtocol = document.createElement("td"), streamItemType = document.createElement("td"), streamItemTypeIcon = document.createElement("img"), streamItemProtection = document.createElement("td"), className = "stream-item", self = this;
    streamItem.appendChild(streamItemType);
    streamItem.appendChild(streamItemName);
    streamItem.appendChild(streamItemProtocol);
    streamItem.appendChild(streamItemProtection);
    if (stream.type.toLowerCase() === "live") {
        className += " stream-live";
        streamItemTypeIcon.src = self.live_icon;
    } else if (stream.type.toLowerCase() === "vod") {
        className += " stream-vod";
        streamItemTypeIcon.src = self.vod_icon;
    }
    streamItemType.appendChild(streamItemTypeIcon);
    streamItemName.innerHTML = stream.name;
    streamItemProtocol.innerHTML = stream.protocol;
    className += " stream-" + stream.protocol.toLowerCase();
    var protections = [];
    if (stream.protData) {
        var protectionsNames = Object.getOwnPropertyNames(stream.protData);
        for (var i = 0, len = protectionsNames.length; i < len; i++) {
            if (protectionsNames[i].indexOf("playready") > -1) {
                className += " stream-playready";
                protections.push("PR");
            } else if (protectionsNames[i].indexOf("widevine") > -1) {
                className += " stream-widevine";
                protections.push("WV");
            }
        }
    }
    streamItemProtection.innerHTML = protections.join(",");
    streamItem.setAttribute("class", className);
    streamItem.addEventListener("click", function() {
        if (self.selectedStreamElement !== null) {
            self.selectedStreamElement.id = "";
        }
        self.selectedStreamElement = this;
        self.selectedStreamElement.id = "stream-selected";
        if (stream.tvmUrl) {
            self.loadTVMSource(stream, onStreamClicked);
        } else {
            onStreamClicked(stream);
        }
    });
    return streamItem;
};

StreamsPanel.prototype.loadStreamList = function() {
    var self = this;
    if (window.jsonData) {
        self.buildStreamsList(window.jsonData.sources);
    } else {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", document.location.pathname + "/../json/sources.json");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                self.buildStreamsList(JSON.parse(xhr.responseText));
            }
        };
        xhr.send();
    }
};

StreamsPanel.prototype.filterStreams = function() {
    var elts = document.getElementsByClassName("stream-item");
    for (var i = 0, len = elts.length; i < len; i++) {
        if ((this.streamFilters.vod && hasClass(elts[i], "stream-vod") || this.streamFilters.live && hasClass(elts[i], "stream-live")) && (this.streamFilters.hls && hasClass(elts[i], "stream-hls") || this.streamFilters.mss && hasClass(elts[i], "stream-mss") || this.streamFilters.dash && hasClass(elts[i], "stream-dash"))) {
            elts[i].style.display = "";
        } else {
            elts[i].style.display = "none";
        }
    }
};

StreamsPanel.prototype.initStreamListFilter = function() {
    var vodFilter = document.getElementById("display-vod-streams"), liveFilter = document.getElementById("display-live-streams"), hlsFilter = document.getElementById("display-hls-streams"), mssFilter = document.getElementById("display-mss-streams"), dashFilter = document.getElementById("display-dash-streams"), self = this;
    vodFilter.addEventListener("click", function(e) {
        self.streamFilters.vod = this.checked;
        self.filterStreams();
    });
    liveFilter.addEventListener("click", function(e) {
        self.streamFilters.live = this.checked;
        self.filterStreams();
    });
    hlsFilter.addEventListener("click", function(e) {
        self.streamFilters.hls = this.checked;
        self.filterStreams();
    });
    mssFilter.addEventListener("click", function(e) {
        self.streamFilters.mss = this.checked;
        self.filterStreams();
    });
    dashFilter.addEventListener("click", function(e) {
        self.streamFilters.dash = this.checked;
        self.filterStreams();
    });
};

StreamsPanel.prototype.onPlayPreviousStream = function() {
    if (this.selectedStreamElement.previousSibling) {
        this.selectedStreamElement.previousSibling.click();
    }
};

StreamsPanel.prototype.onPlayNextStream = function() {
    if (this.selectedStreamElement.nextSibling) {
        this.selectedStreamElement.nextSibling.click();
    }
};

var GraphPanel = function() {
    this.container = null;
    this.legend = null;
    this.update = false;
    this.updateTimeInterval = 200;
    this.updateWindow = 3e4;
    this.steps = this.updateWindow / this.updateTimeInterval;
    this.timer = null;
    this.elapsedTime = 0;
    this.lastTimeLabel = -1;
    this.firstTime = -1;
    this.lastDownloadedBitrate = null;
    this.lastPlayedBitrate = null;
    this.lineChartData = {
        labels: [],
        datasets: [ {
            label: "&mdash; Downloaded Bitrate",
            fillColor: "rgba(41, 128, 185, 0.2)",
            strokeColor: "rgba(41, 128, 185, 1)",
            pointColor: "rgba(41, 128, 185, 1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: []
        }, {
            label: "&mdash; Played Bitrate",
            fillColor: "rgba(231, 76, 60, 0.2)",
            strokeColor: "rgba(231, 76, 60, 1)",
            pointColor: "rgba(231, 76, 60, 1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: []
        } ]
    };
};

GraphPanel.prototype.init = function(ctx, bitrates) {
    this.container = document.getElementById("bitrate-graph-container");
    this.container.className = "module";
    var self = this;
    if (bitrates) {
        window.hasBitratesGraph = new Chart(ctx).LineConstant(self.lineChartData, {
            responsive: true,
            constantCurve: true,
            stepsCount: this.steps,
            animation: false,
            scaleBeginAtZero: false,
            scaleOverride: true,
            scaleSteps: bitrates.length - 1,
            scaleStepWidth: bitrates[bitrates.length - 1] / (bitrates.length - 1),
            scaleStartValue: bitrates[0],
            pointDot: false,
            showTooltips: false,
            scaleShowVerticalLines: false,
            scaleLabels: bitrates,
            legendTemplate: '<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>'
        });
        if (this.legend === null) {
            this.legend = window.hasBitratesGraph.generateLegend();
            document.getElementById("chartLegend").innerHTML = this.legend;
        }
        highBitrateSpan.innerHTML = bitrates[bitrates.length - 1] / 1e6;
        lowBitrateSpan.innerHTML = bitrates[0] / 1e6;
        this.update = true;
        this.elapsedTime = 0;
        window.hasBitratesGraph.addData([ this.lastDownloadedBitrate, this.lastPlayedBitrate ], this.timeLabel(this.elapsedTime));
    }
};

GraphPanel.prototype.setupEventListeners = function() {
    minivents.on("video-ended", this.stop);
};

GraphPanel.prototype.timeLabel = function(_elapsedTime) {
    var label = "";
    _elapsedTime /= 1e3;
    if (_elapsedTime >= this.lastTimeLabel + 1) {
        this.lastTimeLabel = Math.floor(_elapsedTime);
        label = this.lastTimeLabel;
    }
    return label;
};

GraphPanel.prototype.handleGraphUpdate = function() {
    if (window.hasBitratesGraph !== undefined && this.update) {
        if (window.hasBitratesGraph.datasets[0].points.length > this.steps) {
            window.hasBitratesGraph.removeData();
        }
        this.elapsedTime += this.updateTimeInterval;
        window.hasBitratesGraph.addData([ this.lastDownloadedBitrate, this.lastPlayedBitrate ], this.timeLabel(this.elapsedTime));
        window.hasBitratesGraph.update();
    }
};

GraphPanel.prototype.initTimer = function() {
    var self = this;
    if (this.timer === null) {
        this.timer = new LoopTimer(function() {
            self.handleGraphUpdate();
        }, this.updateTimeInterval);
    } else {
        this.timer.stop();
    }
};

GraphPanel.prototype.reset = function() {
    this.lastDownloadedBitrate = null;
    this.lastPlayedBitrate = null;
    this.lastTimeLabel = -1;
    this.firstTime = -1;
    this.elapsedTime = 0;
    if (window.hasBitratesGraph !== undefined) {
        window.hasBitratesGraph.destroy();
        this.lineChartData.labels = [];
        this.lineChartData.datasets[0].data = [];
        this.lineChartData.datasets[1].data = [];
        this.update = false;
    }
};

var ProtectionDataPanel = function() {
    this.protectionDataContainer = null;
};

ProtectionDataPanel.prototype.init = function(elt) {
    this.protectionDataContainer = elt;
};

ProtectionDataPanel.prototype.clear = function() {
    this.protectionDataContainer.innerHTML = "";
    this.protectionDataContainer.className = "module hidden";
};

ProtectionDataPanel.prototype.displayDatum = function(protectionName, protectionDatum) {
    var html = '<tr><td class="protection-data-name" colspan="2">' + protectionName + "</td></tr>", p;
    for (p in protectionDatum) {
        if (protectionDatum.hasOwnProperty(p)) {
            html += '<tr><td class="protection-key">' + p + '</td><td class="protection-value">' + protectionDatum[p] + "</td></tr>";
        }
    }
    return html;
};

ProtectionDataPanel.prototype.display = function(streamInfos) {
    var html = "<table>", p;
    this.protectionDataContainer.className = "module";
    for (p in streamInfos) {
        if (streamInfos.hasOwnProperty(p)) {
            html += this.displayDatum(p, streamInfos[p]);
        }
    }
    html += "</table>";
    this.protectionDataContainer.innerHTML = html;
};

var SettingsPanel = function() {
    this.menuContainer = null;
    this.audioListCombobox = null;
    this.enableSubtitlesCheckbox = null;
    this.subtitleListCombobox = null;
    this.audioTracks = [];
    this.subtitleTracks = [];
    this.currentaudioTrack = null;
    this.currentsubtitleTrack = null;
    this.settingsMenuButton = null;
    this.enableMetricsCheckbox = null;
    this.enableOptimzedZappingCheckbox = null;
    this.metricsAgentCombobox = null;
    this.defaultAudioLangCombobox = null;
    this.defaultSubtitleLangCombobox = null;
    this.optimizedZappingEnabled = true;
    this.metricsConfig = null;
    this.videoBufferLength = null;
    this.audioBufferLength = null;
    this.TrickModeSpeed = null;
};

SettingsPanel.prototype.init = function() {
    this.menuContainer = document.getElementById("menu-container");
    this.audioListCombobox = document.getElementById("audioCombo");
    this.enableSubtitlesCheckbox = document.getElementById("enable-subtitles");
    this.subtitleListCombobox = document.getElementById("subtitleCombo");
    this.settingsMenuButton = document.getElementById("settingsMenuButton");
    this.metricsAgentCombobox = document.getElementById("metrics-agent-options");
    this.enableMetricsCheckbox = document.getElementById("enable-metrics-agent");
    this.defaultAudioLangCombobox = document.getElementById("default_audio_language");
    this.defaultSubtitleLangCombobox = document.getElementById("default_subtitle_language");
    this.enableOptimzedZappingCheckbox = document.getElementById("enable-optimized-zapping");
    this.videoBufferLength = document.getElementById("video_buffer_Length");
    this.audioBufferLength = document.getElementById("audio_buffer_Length");
    this.TrickModeSpeed = document.getElementById("TrickModeSpeed");
    this.setupEventListeners();
    this.initMetricsAgentOptions();
};

SettingsPanel.prototype.setupEventListeners = function() {
    this.audioListCombobox.addEventListener("change", this.audioChanged.bind(this));
    this.enableSubtitlesCheckbox.addEventListener("click", this.onEnableSubtitles.bind(this));
    this.subtitleListCombobox.addEventListener("change", this.subtitleChanged.bind(this));
    this.settingsMenuButton.addEventListener("click", this.onSettingsMenuButtonClicked.bind(this));
    this.enableMetricsCheckbox.addEventListener("click", this.onEnableMetrics.bind(this));
    this.metricsAgentCombobox.addEventListener("change", this.onSelectMetricsAgent.bind(this));
    this.defaultAudioLangCombobox.addEventListener("change", this.onChangeDefaultAudioLang.bind(this));
    this.defaultSubtitleLangCombobox.addEventListener("change", this.onChangeDefaultSubtitleLang.bind(this));
    this.enableOptimzedZappingCheckbox.addEventListener("click", this.onEnableOptimizedZapping.bind(this));
    this.TrickModeSpeed.addEventListener("change", this.onTrickModeSpeedChange.bind(this));
    minivents.on("language-radio-clicked", this.onLanguageChangedFromPlayer.bind(this));
    minivents.on("subtitle-radio-clicked", this.onSubtitleChangedFromPlayer.bind(this));
};

SettingsPanel.prototype.initMetricsAgentOptions = function() {
    var reqMA = new XMLHttpRequest(), i = 0, len = 0, self = this;
    reqMA.onload = function() {
        if (reqMA.status === 200) {
            self.metricsConfig = JSON.parse(reqMA.responseText);
            self.metricsAgentCombobox.innerHTML = "";
            for (i = 0, len = self.metricsConfig.items.length; i < len; i++) {
                self.metricsAgentCombobox.innerHTML += '<option value="' + i + '">' + self.metricsConfig.items[i].name + "</option>";
            }
            self.metricsAgentCombobox.selectedIndex = -1;
        }
    };
    reqMA.open("GET", "metricsagent_config.json", true);
    reqMA.setRequestHeader("Content-type", "application/json");
    reqMA.send();
};

SettingsPanel.prototype.audioChanged = function(e) {
    changeAudio(this.audioTracks[e.target.selectedIndex]);
    document.getElementById(this.audioTracks[e.target.selectedIndex].id).checked = true;
};

SettingsPanel.prototype.subtitleChanged = function(e) {
    changeSubtitle(this.subtitleTracks[e.target.selectedIndex]);
    document.getElementById(this.subtitleTracks[e.target.selectedIndex].id).checked = true;
};

SettingsPanel.prototype.getTrackIndex = function(tracks, id) {
    var index = -1, i = 0, len = 0;
    for (i = 0, len = tracks.length; i < len; i += 1) {
        if (tracks[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

SettingsPanel.prototype.onLanguageChangedFromPlayer = function(track) {
    var index = this.getTrackIndex(this.audioTracks, track);
    if (index > -1) {
        changeAudio(this.audioTracks[index]);
        this.audioListCombobox.selectedIndex = index;
    }
};

SettingsPanel.prototype.onEnableSubtitles = function() {
    this.subtitleListCombobox.disabled = !this.enableSubtitlesCheckbox.checked;
    enableSubtitles(this.enableSubtitlesCheckbox.checked);
};

SettingsPanel.prototype.onSubtitleChangedFromPlayer = function(track) {
    var index = this.getTrackIndex(this.subtitleTracks, track);
    if (index > -1) {
        changeSubtitle(this.subtitleTracks[index]);
        this.subtitleListCombobox.selectedIndex = index;
    }
};

SettingsPanel.prototype.onSettingsMenuButtonClicked = function() {
    if (hasClass(this.menuContainer, "hidden")) {
        this.menuContainer.className = "";
    } else {
        this.menuContainer.className = "hidden";
    }
};

SettingsPanel.prototype.onEnableMetrics = function() {
    if (this.enableMetricsCheckbox.checked) {
        this.metricsAgentCombobox.disabled = false;
    } else {
        this.enableMetricsCheckbox.checked = true;
    }
};

SettingsPanel.prototype.onSelectMetricsAgent = function(value) {
    if (typeof MetricsAgent === "function") {
        if (this.enableMetricsCheckbox.checked) {
            orangeHasPlayer.loadMetricsAgent(this.metricsConfig.items[this.metricsAgentCombobox.selectedIndex]);
        } else if (this.metricsAgent) {
            this.metricsAgent.stop();
        }
    }
};

SettingsPanel.prototype.onChangeDefaultAudioLang = function() {
    orangeHasPlayer.setDefaultAudioLang(this.defaultAudioLangCombobox.value);
};

SettingsPanel.prototype.onChangeDefaultSubtitleLang = function() {
    orangeHasPlayer.setDefaultSubtitleLang(this.defaultSubtitleLangCombobox.value);
};

SettingsPanel.prototype.onEnableOptimizedZapping = function() {
    this.optimizedZappingEnabled = this.enableOptimzedZappingCheckbox.checked;
};

SettingsPanel.prototype.onTrickModeSpeedChange = function(e) {
    var speed = parseInt(e.target.selectedOptions[0].value, 10);
    orangeHasPlayer.setTrickModeSpeed(speed);
};

SettingsPanel.prototype.updateAudioData = function(_audioTracks, _selectedAudioTrack) {
    this.audioTracks = _audioTracks;
    this.currentaudioTrack = _selectedAudioTrack;
    if (this.audioTracks && this.currentaudioTrack) {
        this.addCombo(this.audioTracks, this.audioListCombobox);
        this.selectCombo(this.audioTracks, this.audioListCombobox, this.currentaudioTrack);
    }
};

SettingsPanel.prototype.updateSubtitleData = function(_subtitleTracks, _selectedSubtitleTrack) {
    this.subtitleTracks = _subtitleTracks;
    this.enableSubtitlesCheckbox.disabled = this.subtitleTracks.length > 0 ? false : true;
    this.currentsubtitleTrack = _selectedSubtitleTrack;
    if (this.subtitleTracks && this.currentsubtitleTrack) {
        this.addCombo(this.subtitleTracks, this.subtitleListCombobox);
        this.selectCombo(this.subtitleTracks, this.subtitleListCombobox, this.currentsubtitleTrack);
    }
};

SettingsPanel.prototype.addCombo = function(tracks, combo) {
    var i, option;
    for (i = 0; i < tracks.length; i += 1) {
        option = document.createElement("option");
        option.text = tracks[i].id;
        option.value = tracks[i].lang;
        try {
            combo.add(option, null);
        } catch (error) {
            combo.add(option);
        }
        if (combo.style.visibility === "hidden") {
            combo.style.visibility = "visible";
        }
    }
};

SettingsPanel.prototype.selectCombo = function(tracks, combo, currentTrack) {
    var i;
    for (i = 0; i < tracks.length; i += 1) {
        if (currentTrack === tracks[i]) {
            combo.selectedIndex = i;
        }
    }
};

SettingsPanel.prototype.resetCombo = function(tracks, combo) {
    var i;
    for (i = tracks.length - 1; i >= 0; i -= 1) {
        combo.options.remove(i);
    }
    tracks = [];
    combo.style.visibility = "hidden";
};

SettingsPanel.prototype.reset = function() {
    this.resetCombo(this.audioTracks, this.audioListCombobox);
    this.resetCombo(this.subtitleTracks, this.subtitleListCombobox);
    this.currentaudioTrack = null;
    this.currentsubtitleTrack = null;
    this.videoBufferLength.innerHTML = "";
    this.audioBufferLength.innerHTML = "";
};

var streamUrl = null, playerPanel = null, streamsPanel = null, graphPanel = null, protectionDataPanel = null, settingsPanel = null, isChrome = false, minivents = null;

window.onload = function() {
    minivents = new Events();
    isChrome = bowser.chrome === true ? true : false;
    playerPanel = new PlayerPanel(!isChrome);
    playerPanel.init();
    streamsPanel = new StreamsPanel();
    streamsPanel.init();
    graphPanel = new GraphPanel();
    protectionDataPanel = new ProtectionDataPanel();
    protectionDataPanel.init(document.getElementById("protection-data-container"));
    settingsPanel = new SettingsPanel();
    settingsPanel.init();
    getDOMElements();
    createHasPlayer(!isChrome);
    displayVersion();
    displayTerminalId();
    var urlParam = getURLParameter("url");
    if (urlParam) {
        onStreamClicked({
            url: urlParam,
            protData: undefined
        });
    }
};

var getDOMElements = function() {
    streamUrl = document.querySelector(".stream-url");
};

var displayVersion = function() {
    var title = document.getElementById("app-title");
    title.innerHTML += " " + orangeHasPlayer.getVersionFull();
};

var displayTerminalId = function() {
    var terminalId = document.getElementById("terminal-id");
    terminalId.innerHTML += " " + orangeHasPlayer.getTerminalId();
};

var getURLParameter = function(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [ , "" ])[1].replace(/\+/g, "%20")) || null;
};

var onStreamClicked = function(streamInfos) {
    reset();
    loadStream(streamInfos, settingsPanel.optimizedZappingEnabled);
    if (streamInfos.protData) {
        protectionDataPanel.display(streamInfos.protData);
    }
    graphPanel.initTimer();
    streamUrl.innerHTML = streamInfos.url;
};

var handleAudioData = function(_audioTracks, _selectedAudioTrack) {
    settingsPanel.updateAudioData(_audioTracks, _selectedAudioTrack);
    playerPanel.resetLanguageLines();
    playerPanel.updateAudioData(_audioTracks, _selectedAudioTrack);
};

var handleSubtitleData = function(_subtitleTracks, _selectedSubtitleTrack) {
    settingsPanel.updateSubtitleData(_subtitleTracks, _selectedSubtitleTrack);
    playerPanel.updateSubtitleData(_subtitleTracks, _selectedSubtitleTrack);
};

var handleSubtitleEnter = function(subtitleData) {
    playerPanel.enterSubtitle(subtitleData);
};

var handleSubtitleExit = function(subtitleData) {
    playerPanel.exitSubtitle(subtitleData);
};

var handlePlayState = function(state) {
    playerPanel.setPlaying(state);
    if (state === true) {
        playerPanel.hideLoadingElement();
        graphPanel.timer.start();
    } else {
        graphPanel.timer.pause();
    }
};

var handleBuffering = function(show) {
    if (show === true) {
        playerPanel.showLoadingElement();
    } else {
        playerPanel.hideLoadingElement();
    }
};

var handleVolumeChange = function(volumeLevel) {
    playerPanel.onVolumeChange(volumeLevel);
};

var handleDuration = function(duration) {
    playerPanel.setDuration(duration);
};

var handleTimeUpdate = function(time) {
    playerPanel.setPlayingTime(time);
};

var handleDownloadedBitrate = function(bitrate, time) {
    graphPanel.lastDownloadedBitrate = bitrate;
};

var handlePlayBitrate = function(bitrate, time) {
    graphPanel.lastPlayedBitrate = bitrate;
    playerPanel.setCurrentBitrate(bitrate);
};

var handleBufferLevelUpdated = function(type, level) {
    if (type === "video") {
        settingsPanel.videoBufferLength.innerHTML = level + " s";
    } else if (type === "audio") {
        settingsPanel.audioBufferLength.innerHTML = level + " s";
    }
};

var handleBitrates = function(bitrates) {
    var ctx = document.getElementById("canvas").getContext("2d");
    graphPanel.init(ctx, bitrates);
};

var handleWarning = function(warning) {
    console.warn("Code: " + warning.code + ", message: " + warning.message, warning.data);
};

var handleError = function(error) {
    playerPanel.displayError(error.code, error.message);
};

var handleVideoEnd = function() {
    playerPanel.reset();
    handleBuffering(false);
};

var reset = function() {
    protectionDataPanel.clear();
    playerPanel.reset();
    graphPanel.reset();
    settingsPanel.reset();
};

!function(e, t) {
    typeof module != "undefined" && module.exports ? module.exports = t() : typeof define == "function" && define.amd ? define(t) : this[e] = t();
}("bowser", function() {
    function t(t) {
        function n(e) {
            var n = t.match(e);
            return n && n.length > 1 && n[1] || "";
        }
        function r(e) {
            var n = t.match(e);
            return n && n.length > 1 && n[2] || "";
        }
        var i = n(/(ipod|iphone|ipad)/i).toLowerCase(), s = /like android/i.test(t), o = !s && /android/i.test(t), u = /CrOS/.test(t), a = n(/edge\/(\d+(\.\d+)?)/i), f = n(/version\/(\d+(\.\d+)?)/i), l = /tablet/i.test(t), c = !l && /[^-]mobi/i.test(t), h;
        /opera|opr/i.test(t) ? h = {
            name: "Opera",
            opera: e,
            version: f || n(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
        } : /yabrowser/i.test(t) ? h = {
            name: "Yandex Browser",
            yandexbrowser: e,
            version: f || n(/(?:yabrowser)[\s\/](\d+(\.\d+)?)/i)
        } : /windows phone/i.test(t) ? (h = {
            name: "Windows Phone",
            windowsphone: e
        }, a ? (h.msedge = e, h.version = a) : (h.msie = e, h.version = n(/iemobile\/(\d+(\.\d+)?)/i))) : /msie|trident/i.test(t) ? h = {
            name: "Internet Explorer",
            msie: e,
            version: n(/(?:msie |rv:)(\d+(\.\d+)?)/i)
        } : u ? h = {
            name: "Chrome",
            chromeBook: e,
            chrome: e,
            version: n(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
        } : /chrome.+? edge/i.test(t) ? h = {
            name: "Microsoft Edge",
            msedge: e,
            version: a
        } : /chrome|crios|crmo/i.test(t) ? h = {
            name: "Chrome",
            chrome: e,
            version: n(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
        } : i ? (h = {
            name: i == "iphone" ? "iPhone" : i == "ipad" ? "iPad" : "iPod"
        }, f && (h.version = f)) : /sailfish/i.test(t) ? h = {
            name: "Sailfish",
            sailfish: e,
            version: n(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
        } : /seamonkey\//i.test(t) ? h = {
            name: "SeaMonkey",
            seamonkey: e,
            version: n(/seamonkey\/(\d+(\.\d+)?)/i)
        } : /firefox|iceweasel/i.test(t) ? (h = {
            name: "Firefox",
            firefox: e,
            version: n(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
        }, /\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(t) && (h.firefoxos = e)) : /silk/i.test(t) ? h = {
            name: "Amazon Silk",
            silk: e,
            version: n(/silk\/(\d+(\.\d+)?)/i)
        } : o ? h = {
            name: "Android",
            version: f
        } : /phantom/i.test(t) ? h = {
            name: "PhantomJS",
            phantom: e,
            version: n(/phantomjs\/(\d+(\.\d+)?)/i)
        } : /blackberry|\bbb\d+/i.test(t) || /rim\stablet/i.test(t) ? h = {
            name: "BlackBerry",
            blackberry: e,
            version: f || n(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
        } : /(web|hpw)os/i.test(t) ? (h = {
            name: "WebOS",
            webos: e,
            version: f || n(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
        }, /touchpad\//i.test(t) && (h.touchpad = e)) : /bada/i.test(t) ? h = {
            name: "Bada",
            bada: e,
            version: n(/dolfin\/(\d+(\.\d+)?)/i)
        } : /tizen/i.test(t) ? h = {
            name: "Tizen",
            tizen: e,
            version: n(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || f
        } : /safari/i.test(t) ? h = {
            name: "Safari",
            safari: e,
            version: f
        } : h = {
            name: n(/^(.*)\/(.*) /),
            version: r(/^(.*)\/(.*) /)
        }, !h.msedge && /(apple)?webkit/i.test(t) ? (h.name = h.name || "Webkit", h.webkit = e, 
        !h.version && f && (h.version = f)) : !h.opera && /gecko\//i.test(t) && (h.name = h.name || "Gecko", 
        h.gecko = e, h.version = h.version || n(/gecko\/(\d+(\.\d+)?)/i)), !h.msedge && (o || h.silk) ? h.android = e : i && (h[i] = e, 
        h.ios = e);
        var p = "";
        h.windowsphone ? p = n(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i) : i ? (p = n(/os (\d+([_\s]\d+)*) like mac os x/i), 
        p = p.replace(/[_\s]/g, ".")) : o ? p = n(/android[ \/-](\d+(\.\d+)*)/i) : h.webos ? p = n(/(?:web|hpw)os\/(\d+(\.\d+)*)/i) : h.blackberry ? p = n(/rim\stablet\sos\s(\d+(\.\d+)*)/i) : h.bada ? p = n(/bada\/(\d+(\.\d+)*)/i) : h.tizen && (p = n(/tizen[\/\s](\d+(\.\d+)*)/i)), 
        p && (h.osversion = p);
        var d = p.split(".")[0];
        if (l || i == "ipad" || o && (d == 3 || d == 4 && !c) || h.silk) h.tablet = e; else if (c || i == "iphone" || i == "ipod" || o || h.blackberry || h.webos || h.bada) h.mobile = e;
        return h.msedge || h.msie && h.version >= 10 || h.yandexbrowser && h.version >= 15 || h.chrome && h.version >= 20 || h.firefox && h.version >= 20 || h.safari && h.version >= 6 || h.opera && h.version >= 10 || h.ios && h.osversion && h.osversion.split(".")[0] >= 6 || h.blackberry && h.version >= 10.1 ? h.a = e : h.msie && h.version < 10 || h.chrome && h.version < 20 || h.firefox && h.version < 20 || h.safari && h.version < 6 || h.opera && h.version < 10 || h.ios && h.osversion && h.osversion.split(".")[0] < 6 ? h.c = e : h.x = e, 
        h;
    }
    var e = !0, n = t(typeof navigator != "undefined" ? navigator.userAgent : "");
    return n.test = function(e) {
        for (var t = 0; t < e.length; ++t) {
            var r = e[t];
            if (typeof r == "string" && r in n) return !0;
        }
        return !1;
    }, n._detect = t, n;
});
/* jshint ignore:end */

var jsonData=jsonData||{};jsonData.sources={items:[{type:"Live",protocol:"HLS",name:"VIMTV1",url:"http://161.105.253.165/streaming/1.m3u8",browsers:"cdsbi"},{type:"Live",protocol:"HLS",name:"VIMTV2",url:"http://161.105.253.165/streaming/2.m3u8",browsers:"cdsbi"},{type:"Live",protocol:"HLS",name:"VIMTV3",url:"http://161.105.253.165/streaming/3.m3u8",browsers:"cdsbi"},{type:"Live",protocol:"HLS",name:"VIMTV4",url:"http://161.105.253.165/streaming/4.m3u8",browsers:"cdsbi"},{type:"Live",protocol:"HLS",name:"Envivio",url:"http://iphone.envivio.tv/iphone/downLoads/ch1/index.m3u8",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Norigin Media Spain with Subtitles",url:"http://80.12.13.72/jXFcOxmrQLZN6QPzmZwlLw/3450257649/13214/89042/8/live/smooth/TF1.isml/manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Arte with Subtitles",url:"http://2is7server1.rd.francetelecom.com/C4/C4-50_TVApp2.isml/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"France 2 with Subtitles",url:"http://2is7server1.rd.francetelecom.com/C4/C4-41_S2.isml/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Norigin with Subtitles",url:"http://80.12.13.72/smooth/TEST_SOURCE/subtitles/Padding_OSP/Profil1/Profil1.ism/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Smooth + PlayReady DRM",url:"http://2is7server1.rd.francetelecom.com/VOD/selection-SD-DRM/selection-SD-DRM.ism/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Smooth TF1 Halo",url:"http://161.105.176.18/ss/OFR-TF1-IP.isml/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Smooth TF1 Halo + DRM",url:"http://161.105.176.18/ss/OFR-TF1-IP-DRM.isml/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Smooth + PlayReady DRM 2",url:"http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest",browsers:"cdsbi"},{name:"Smooth + PlayReady DRM + cdmData",type:"VOD",protocol:"MSS",url:"http://161.105.194.170/VOD/VODE/Ateme3505/ATEME3505_enc452_MSS_PoP/PoP.ism/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://roap.purplecast.us/test/services/StandardPlayReadyAquireLicenseByContent.cfm?distrib=olps",cdmData:"B2C99B73-CA41-4003-84A3AA16CE92B304"}}},{type:"VOD",protocol:"MSS",name:"VODEW2.1 Test 1",url:"http://cmsew.ak.inter-cdnrd.orange-business.com/CMS/Smooth/0c6153f1MIB4_MSS/0c6153f1.ism/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://licenserpp.purpledrm.com/pp/StandardPlayReadyAquireLicenseByContent.cfm?distrib=ofnewtv",cdmData:"7146A3D4-1AE8-4FA5-B209242420EAAF3F"}}},{type:"VOD",protocol:"MSS",name:"VODEW2.1 Test 2",url:"http://cmsew.ak.inter-cdnrd.orange-business.com/CMS/Smooth/046f5603MIB4_MSS/046f5603.ism/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://licenserpp.purpledrm.com/pp/StandardPlayReadyAquireLicenseByContent.cfm?distrib=ofnewtv",cdmData:"A820A4C5-B7D6-4C76-9F722AF55CDBEA94"}}},{type:"VOD",protocol:"MSS",name:"VODEW2.1 Test 3",url:"http://cmsew.ak.inter-cdnrd.orange-business.com/CMS/Smooth/03094644MIB4_MSS/03094644.ism/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://licenserpp.purpledrm.com/pp/StandardPlayReadyAquireLicenseByContent.cfm?distrib=ofnewtv",cdmData:"395E71B7-F659-4FE5-A60A64C4B2CDF6E0"}}},{type:"VOD",protocol:"MSS",name:"TF1 Widevine",url:"http://2is7server2.rd.francetelecom.com/VOD/TF1-WN/TF1-WN.ism/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://mercury.rd.francetelecom.com/pr20/RightsManager.asmx?rid=0&hexkey=g+MuUfsOOFOm/ozQnpGBnw=="},"com.widevine.alpha":{laURL:"http://widevine-proxy.appspot.com/proxy",pssh:"AAAAY3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAAEMIARIQxXr4hC5lVZm6Epugb9e0JRoNd2lkZXZpbmVfdGVzdCIYTVRFeE1URXhNVEV4TVRFeE1URXhNUT09KgJTRDIA"}}},{type:"VOD",protocol:"MSS",name:"ERROR-TF1 Widevine - bad back Url",url:"http://2is7server2.rd.francetelecom.com/VOD/TF1-WN/TF1-WN.ism/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://mercury.rd.francetelecom.com/pr20/RightsManager.asmx?rid=0&hexkey=g+MuUfsOOFOm/ozQnpGBnw=="},"com.widevine.alpha":{laURL:"http://widevine-proxy.appspot-Orange.com/proxy",pssh:"AAAAY3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAAEMIARIQxXr4hC5lVZm6Epugb9e0JRoNd2lkZXZpbmVfdGVzdCIYTVRFeE1URXhNVEV4TVRFeE1URXhNUT09KgJTRDIA"}}},{type:"Live",protocol:"MSS",name:"TF1 Widevine",url:"http://161.105.176.18/ss/ss/TF1-WN.isml/Manifest",browsers:"cdsbi",protData:{"com.widevine.alpha":{laURL:"http://widevine-proxy.appspot.com/proxy",pssh:"AAAAY3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAAEMIARIQxXr4hC5lVZm6Epugb9e0JRoNd2lkZXZpbmVfdGVzdCIYTVRFeE1URXhNVEV4TVRFeE1URXhNUT09KgJTRDIA"}}},{type:"VOD",protocol:"MSS",name:"TF1 Widevine Test",url:"http://2is7server2.rd.francetelecom.com/VOD/TF1-WN-test/TF1-WN-test.ism/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://mercury.rd.francetelecom.com/pr20/RightsManager.asmx?rid=0&hexkey=zsI+vcD1FB8Mq4/QpftMxg=="},"com.widevine.alpha":{laURL:"http://widevine-proxy.appspot.com/proxy",pssh:"AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQh7LJSxP0WBaU0gg8/ekcrhoNd2lkZXZpbmVfdGVzdCIQMzMzMzMzMzMzMzMzMzMzMyoCU0QyAA=="}}},{type:"Live",protocol:"MSS",name:"TF1 Widevine Test",url:"http://161.105.176.18/ss/ss/TF1-WN-test.isml/Manifest",browsers:"cdsbi",protData:{"com.microsoft.playready":{laURL:"http://mercury.rd.francetelecom.com/pr20/RightsManager.asmx?rid=0&hexkey=zsI+vcD1FB8Mq4/QpftMxg=="},"com.widevine.alpha":{laURL:"http://widevine-proxy.appspot.com/proxy",pssh:"AAAAW3Bzc2gAAAAA7e+LqXnWSs6jyCfc1R0h7QAAADsIARIQh7LJSxP0WBaU0gg8/ekcrhoNd2lkZXZpbmVfdGVzdCIQMzMzMzMzMzMzMzMzMzMzMyoCU0QyAA=="}}},{type:"VOD",protocol:"MSS",name:"SynchroAV 2 stream audio AAC+AACH",url:"http://161.105.194.170/VOD/VODE/Ateme3511/ATEME3511_clr_MSS_SynchroAV/Synchro_AV.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Big Buck Bunny + PUB video midroll",url:"http://2is7server1.rd.francetelecom.com/VOD/BBB-SD/big_buck_bunny_1080p_stereo.ism/Manifest",mastUrl:"http://2is7server2.rd.francetelecom.com/testsMAST/02_MAST_midroll.xml",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Big Buck Bunny + PUB video preroll",url:"http://2is7server1.rd.francetelecom.com/VOD/BBB-SD/big_buck_bunny_1080p_stereo.ism/Manifest",mastUrl:"http://2is7server2.rd.francetelecom.com/testsMAST/01_MAST_preroll.xml",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Big Buck Bunny + PUB video preroll + midroll",url:"http://2is7server1.rd.francetelecom.com/VOD/BBB-SD/big_buck_bunny_1080p_stereo.ism/Manifest",mastUrl:"http://2is7server2.rd.francetelecom.com/testsMAST/04_MAST_preroll_midroll.xml",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Big Buck Bunny + PUB image preroll",url:"http://2is7server1.rd.francetelecom.com/VOD/BBB-SD/big_buck_bunny_1080p_stereo.ism/Manifest",mastUrl:"http://2is7server2.rd.francetelecom.com/testsMAST/06_MAST_preroll_image.xml",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Audio stream AAC HE implicit mode",url:"http://161.105.194.170/VOD/VODE/TVN/SS_HEAACv2_Implicit.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Audio stream AAC HE explicit backward mode",url:"http://161.105.194.170/VOD/VODE/TVN/SS_HEAACv2_ExplicitBwd.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Volver",url:"http://2is7server1.rd.francetelecom.com/VOD/xBox/PIVOT%20VOLVER_PS-output.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Montagne",url:"http://2is7server1.rd.francetelecom.com/VOD/Montagne/EE3_SS-H264_TERRE_MONTAGNES_FR_EN_CEEFAX.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Big Buck Bunny",url:"http://2is7server1.rd.francetelecom.com/VOD/BBB-SD/big_buck_bunny_1080p_stereo.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"SuperSpeedway",url:"http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Elephants Dream (multi-audio/text)",url:"http://streams.smooth.vertigo.com/elephantsdream/Elephants_Dream_1024-h264-st-aac.ism/manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Big Buck Bunny (gzipped - AAC-HE)",url:"http://2is7server1.rd.francetelecom.com/VOD/gzip/bbb.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Volver",url:"http://2is7server1.rd.francetelecom.com/VOD/Volver/PIVOT VOLVER_PS_smooth.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Arte",url:"http://161.105.176.12/VOD/Arte/C4-51_S1.ism/manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"VIF Steph Richard",url:"http://161.105.176.12/VIF/srichard2.ism/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Anevia - Red Bull",url:"http://demo.anevia.com:3128/vod/disk1/content1/ss-ss/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"Anevia - Sintel",url:"http://demo.anevia.com:3128/vod/disk1/content2/ss-ss/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"TF1 Halo/IIS 7.13",url:"http://161.105.176.13/Halo/ch1.isml/manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"France 2",url:"http://2is7server1.rd.francetelecom.com/C4/C4-46_S2.isml/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"France 24",url:"http://2is7server1.rd.francetelecom.com/C4/C4-46_S1.isml/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"Arte multi-audio",url:"http://2is7server1.rd.francetelecom.com/C4/C4-49_S1.isml/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"LIVE - BFM-TV (DVR)",url:"http://2is7server1.rd.francetelecom.com/C4/C4-50_TVApp1.isml/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"MSS",name:"SynchroAV",url:"http://2is7server2.rd.francetelecom.com/VOD/Synchro/C4-52_S1.ism/Manifest",browsers:"cdsbi"},{type:"Live",protocol:"MSS",name:"SynchroAV",url:"http://2is7server2.rd.francetelecom.com/C4/C4-52_S1.isml/Manifest",browsers:"cdsbi"},{type:"VOD",protocol:"DASH",name:"PrinceOfPersia (2 audios)",url:"http://10.194.60.110/VIDEO/DASH/VOD/PrinceOfPersia/manifest.mpd",browsers:"cdsbi"},{type:"VOD",protocol:"DASH",name:"DASH + PlayReady DRM",url:"http://wams.edgesuite.net/media/SintelTrailer_Smooth_from_WAME_720p_Main_Profile_CENC/CENC/sintel_trailer-720p.ism/manifest(format=mpd-time-csf)",browsers:"cdsbi"},{type:"Live",protocol:"DASH",name:"TF1",url:"http://apache1.rd.francetelecom.com/DASH/ch1/manifest.mpd",browsers:"cdsbi"},{type:"VOD",protocol:"DASH",name:"Caption Test",url:"http://dash.edgesuite.net/akamai/test/caption_test/ElephantsDream/elephants_dream_480p_heaac5_1.mpd",browsers:""},{type:"VOD",protocol:"DASH",name:"4K",url:"http://dash.edgesuite.net/akamai/test/tears1/tearsofsteel_4096x1714_14Mbps.mpd",browsers:"cd"},{type:"VOD",protocol:"DASH",name:"Fraunhofer - HEACC 2.0 - Dream",url:"http://dash.edgesuite.net/digitalprimates/fraunhofer/480p_video/heaac_2_0_with_video/ElephantsDream/elephants_dream_480p_heaac2_0.mpd",browsers:"cdb"},{type:"VOD",protocol:"DASH",name:"Fraunhofer - HEACC 2.0 - Sintel",url:"http://dash.edgesuite.net/digitalprimates/fraunhofer/480p_video/heaac_2_0_with_video/Sintel/sintel_480p_heaac2_0.mpd",browsers:"cdb"},{name:"Fraunhofer - HEACC 5.1 - 6 CH ID",url:"http://dash.edgesuite.net/digitalprimates/fraunhofer/480p_video/heaac_5_1_with_video/6chId/6chId_480p_heaac5_1.mpd",browsers:"cdb"},{name:"Fraunhofer - HEACC 5.1 - Dream",url:"http://dash.edgesuite.net/digitalprimates/fraunhofer/480p_video/heaac_5_1_with_video/ElephantsDream/elephants_dream_480p_heaac5_1.mpd",browsers:"cdb"},{name:"Fraunhofer - HEACC 5.1 - Sintel",url:"http://dash.edgesuite.net/digitalprimates/fraunhofer/480p_video/heaac_5_1_with_video/Sintel/sintel_480p_heaac5_1.mpd",browsers:"cdb"},{name:"Fraunhofer - Audio Only - Dream",url:"http://dash.edgesuite.net/digitalprimates/fraunhofer/audio_only/heaac_2_0_without_video/ElephantsDream/elephants_dream_audio_only_heaac2_0.mpd",browsers:"cdb"},{name:"Fraunhofer - Audio Only - Sintel",url:"http://dash.edgesuite.net/digitalprimates/fraunhofer/audio_only/heaac_2_0_without_video/Sintel/sintel_audio_only_heaac2_0.mpd",browsers:"cdb"},{name:"Path 1 Live",url:"http://dash-live-path1.edgesuite.net/dash/manifest.mpd",browsers:""},{name:"Unified Streaming Live",url:"http://live.unified-streaming.com/loop/loop.isml/loop.mpd?format=mp4&session_id=25020",browsers:""},{name:"Wowza SegmentList",url:"http://wowzaec2demo.streamlock.net/live/bigbuckbunny/manifest_mpm4sav_mvlist.mpd",browsers:""},{name:"Wowza SegmentTemplate",url:"http://wowzaec2demo.streamlock.net/live/bigbuckbunny/manifest_mpm4sav_mvnumber.mpd",browsers:""},{name:"Wowza SegmentTimeline",url:"http://wowzaec2demo.streamlock.net/live/bigbuckbunny/manifest_mpm4sav_mvtime.mpd",browsers:""},{name:"Thomson Live",url:"http://tvnlive.dashdemo.edgesuite.net/live/manifest.mpd",browsers:""},{name:"Media Excel Live 1",url:"http://dashdemo.edgesuite.net/mediaexcel/live/ch1/dash.mpd",browsers:""},{name:"Media Excel Live 2",url:"http://dashdemo.edgesuite.net/mediaexcel/live/ch2/dash.mpd",browsers:""},{name:"Envivio",url:"http://dash.edgesuite.net/envivio/dashpr/clear/Manifest.mpd",browsers:"cdsbi"},{name:"Segment List",url:"http://www.digitalprimates.net/dash/streams/gpac/mp4-main-multi-mpd-AV-NBS.mpd",browsers:"cdsbi"},{name:"Segment Template",url:"http://www.digitalprimates.net/dash/streams/mp4-live-template/mp4-live-mpd-AV-BS.mpd",browsers:"cdsbi"},{name:"Unified Streaming - Timeline",url:"http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd",browsers:"cdsbi"},{name:"Microsoft #1",url:"http://wams.edgesuite.net/media/SintelTrailer_MP4_from_WAME/sintel_trailer-1080p.ism/manifest(format=mpd-time-csf)",browsers:"cdsbi"},{name:"Microsoft #2",url:"http://wams.edgesuite.net/media/SintelTrailer_Smooth_from_WAME/sintel_trailer-1080p.ism/manifest(format=mpd-time-csf)",browsers:"cdsbi"},{name:"Microsoft #3",url:"http://wams.edgesuite.net/media/SintelTrailer_Smooth_from_WAME_720p_Main_Profile/sintel_trailer-720p.ism/manifest(format=mpd-time-csf)",browsers:"cdsbi"},{name:"Microsoft #4",url:"http://wams.edgesuite.net/media/MPTExpressionData01/ElephantsDream_1080p24_IYUV_2ch.ism/manifest(format=mpd-time-csf)",browsers:"cdsbi"},{name:"Microsoft #5",url:"http://wams.edgesuite.net/media/MPTExpressionData02/BigBuckBunny_1080p24_IYUV_2ch.ism/manifest(format=mpd-time-csf)",browsers:"cdsbi"},{name:"Microsoft Cenc #1",url:"http://wams.edgesuite.net/media/SintelTrailer_Smooth_from_WAME_720p_Main_Profile_CENC/CENC/sintel_trailer-720p.ism/manifest(format=mpd-time-csf)",browsers:"i"},{name:"Microsoft Cenc #4",url:"http://wams.edgesuite.net/media/SintelTrailer_Smooth_from_WAME_CENC/CENC/sintel_trailer-1080p.ism/manifest(format=mpd-time-csf)",browsers:"i"},{name:"D-Dash #1",url:"http://www-itec.uni-klu.ac.at/dash/ddash/mpdGenerator.php?segmentlength=2&type=full",browsers:""},{name:"D-Dash #2",url:"http://www-itec.uni-klu.ac.at/dash/ddash/mpdGenerator.php?segmentlength=4&type=full",browsers:""},{name:"D-Dash #3",url:"http://www-itec.uni-klu.ac.at/dash/ddash/mpdGenerator.php?segmentlength=6&type=full",browsers:""},{name:"D-Dash #4",url:"http://www-itec.uni-klu.ac.at/dash/ddash/mpdGenerator.php?segmentlength=8&type=full",browsers:""},{name:"D-Dash #5",url:"http://www-itec.uni-klu.ac.at/dash/ddash/mpdGenerator.php?segmentlength=10&type=full",browsers:""},{name:"D-Dash #6",url:"http://www-itec.uni-klu.ac.at/dash/ddash/mpdGenerator.php?segmentlength=15&type=full",browsers:""},{name:"DASH-AVC/264 – test vector 1a - Netflix",url:"http://dash.edgesuite.net/dash264/TestCases/1a/netflix/exMPD_BIP_TC1.mpd",browsers:"cdsbi"},{name:"DASH-AVC/264 – test vector 1a - Sony",url:"http://dash.edgesuite.net/dash264/TestCases/1a/sony/SNE_DASH_SD_CASE1A_REVISED.mpd",browsers:"cdsbi"},{name:"DASH-AVC/264 – test vector 1b - Envivio",url:"http://dash.edgesuite.net/dash264/TestCases/1b/envivio/manifest.mpd",browsers:"cdsbi"},{name:"DASH-AVC/264 – test vector 1b - Thomson",url:"http://dash.edgesuite.net/dash264/TestCases/1b/thomson-networks/2/manifest.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 1c - Envivio",url:"http://dash.edgesuite.net/dash264/TestCases/1c/envivio/manifest.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 2a - Envivio",url:"http://dash.edgesuite.net/dash264/TestCases/2a/envivio/manifest.mpd",browsers:"cdsbi"},{name:"DASH-AVC/264 – test vector 2a - Sony",url:"http://dash.edgesuite.net/dash264/TestCases/2a/sony/SNE_DASH_CASE_2A_SD_REVISED.mpd",browsers:"cdsbi"},{name:"DASH-AVC/264 – test vector 2a - Thomson",url:"http://dash.edgesuite.net/dash264/TestCases/2a/thomson-networks/2/manifest.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 3a - Fraunhofer",url:"http://dash.edgesuite.net/dash264/TestCases/3a/fraunhofer/ed.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 3b - Fraunhofer",url:"http://dash.edgesuite.net/dash264/TestCases/3b/fraunhofer/elephants_dream_heaac2_0.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 3b - Sony",url:"http://dash.edgesuite.net/dash264/TestCases/3b/sony/SNE_DASH_CASE3B_SD_REVISED.mpd",browsers:"cdsbi"},{name:"DASH-AVC/264 – test vector 4b - Sony",url:"http://dash.edgesuite.net/dash264/TestCases/4b/sony/SNE_DASH_CASE4B_SD_REVISED.mpd",browsers:"cdsbi"},{name:"DASH-AVC/264 – test vector 5a - Thomson/Envivio",url:"http://dash.edgesuite.net/dash264/TestCases/5a/1/manifest.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 5b - Thomson/Envivio",url:"http://dash.edgesuite.net/dash264/TestCases/5b/1/manifest.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 6c - Envivio Manifest 1",url:"http://dash.edgesuite.net/dash264/TestCases/6c/envivio/manifest.mpd",browsers:""},{name:"DASH-AVC/264 – test vector 6c - Envivio Manifest 2",url:"http://dash.edgesuite.net/dash264/TestCases/6c/envivio/manifest2.mpd",browsers:""}]};