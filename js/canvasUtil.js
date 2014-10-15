(function() {

	var util = this.CanvasUtil = {};

	util.fillColor = function(startX, startY, imgData, penColor, canvas) {
		var cWidth = canvas.width;
		var cHeight = canvas.height;
		var toImageDataPixelPos = function(x, y) {
			return ((cWidth * y) + x) * 4;
		};
		var startPixelPos = toImageDataPixelPos(startX, startY);
		var baseColor = {
			red: imgData.data[startPixelPos],
			green: imgData.data[startPixelPos + 1],
			blue: imgData.data[startPixelPos + 2],
			alpha: 1
		};

		var setImageDataPixelPos = function(pp, imgD) {
			imgD.data[pp] = penColor.red;
			imgD.data[pp + 1] = penColor.green;
			imgD.data[pp + 2] = penColor.blue;
			imgD.data[pp + 3] = 255 * penColor.alpha;
			return imgD;
		};

		var isMatchColor = function(x, y, imgD, cl, range) {
			var pp = toImageDataPixelPos(x, y);
			var r = imgD.data[pp],
				g = imgD.data[pp + 1],
				b = imgD.data[pp + 2];

			if ((r === cl.red) &&
				(g === cl.green) &&
				(b === cl.blue)) {
				return true;
			} else {
				return false;
			}
		};

		var paintHorizontal = function(leftX, rightX, y, imgD) {
			for (var x = leftX; x <= rightX; x++) {
				var pp = toImageDataPixelPos(x, y);
				imgD = setImageDataPixelPos(pp, imgD);
			}
			return imgD;
		};

		var scanLine = function(leftX, rightX, y, imgD, buffer) {
			while (leftX <= rightX) {
				for (; leftX <= rightX; leftX++) {
					if (isMatchColor(leftX, y, imgD, baseColor)) {
						break;
					}
				}
				if (rightX < leftX) {
					break;
				}
				for (; leftX <= rightX; leftX++) {
					if (!isMatchColor(leftX, y, imgD, baseColor)) {
						break;
					}
				}
				buffer.push({
					x: leftX - 1,
					y: y
				});
			}
		};

		var paint = function(x, y, imgD) {
			if (isMatchColor(x, y, imgD, penColor)) {
				return imgD;
			}
			var buffer = [];
			buffer.push({
				x: x,
				y: y
			});
			while (buffer.length > 0) {
				var point = buffer.pop();
				var leftX = point.x;
				var rightX = point.x;
				/* skip already painted */
				if (isMatchColor(point.x, point.y, imgD, penColor)) {
					continue;
				}
				/* search left point */
				for (; 0 < leftX; leftX--) {
					if (!isMatchColor(leftX - 1, point.y, imgD, baseColor)) {
						break;
					}
				}
				/* search right point */
				for (; rightX < cWidth - 1; rightX++) {
					if (!isMatchColor(rightX + 1, point.y, imgD, baseColor)) {
						break;
					}
				}
				/* paint from leftX to rightX */
				imgD = paintHorizontal(leftX, rightX, point.y, imgD);
				/* search next lines */
				if (point.y + 1 < cHeight) {
					scanLine(leftX, rightX, point.y + 1, imgD, buffer);
				}
				if (point.y - 1 >= 0) {
					scanLine(leftX, rightX, point.y - 1, imgD, buffer);
				}
			}
			return imgD;
		};

		return paint(startX, startY, imgData);
	};

	util.convertToBnW = function(imageData, threshold) {
		if (threshold < 0 || 255 < threshold) {
			return null;
		}
		var d = imageData.data,
			hsv, val;
		for (var i = 0; i < d.length; i += 4) {
			hsv = ColorUtil.RGBtoHSV(d[i], d[i + 1], d[i + 2]);
			val = (hsv.v < threshold) ? 0 : 255;
			d[i] = val;
			d[i + 1] = val;
			d[i + 2] = val;
			// d[i+3]に格納されたα値は変更しない
		}
		return imageData;
	};

	util.reverseTone = function(imageData) {
		var d = imageData.data;
		for (var i = 0; i < d.length; i += 4) {
			d[i] = 255 - d[i];
			d[i + 1] = 255 - d[i + 1];
			d[i + 2] = 255 - d[i + 2];
			// d[i+3]に格納されたα値は変更しない
		}
		return imageData;
	};
}).call(this);