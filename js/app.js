$(function() {
	var candidates = [
		'臥薪嘗胆',
		'竜頭蛇尾',
		'温故知新',
		'反面教師',
		'異口同音',
		'風声鶴唳',
		'四字熟語',
		'五穀豊穣',
		'画竜点睛',
		'匍匐前進',
		'白昼堂堂',
		'四月馬鹿',
		'携帯電話',
		'脊髄反射',
		'誤認逮捕',
		'意識調査',
		'専門用語',
		'菱垣廻船',
		'百戦錬磨',
		'豪放磊落',
		'舞台女優',
		'暴風警報',
		'大型台風',
		'既得権益',
		'準備運動',
		'死海文書',
		'無神論者',
		'中華飯店',
		'鳥取砂丘',
		'時限爆弾',
		'夜露死苦',
		'更級日記',
		'鯨飲馬食',
		'損害賠償',
		'五言絶句',
		'興味津々',
		'相撲部屋',
		'普通名詞',
		'涅槃寂静',
		'聖教新聞',
		'保育園児',
		'罵詈雑言',
		'鹿児島県',
		'尊皇攘夷',
		'阿鼻叫喚',
		'超過勤務',
		'累進課税',
		'百円硬貨',
		'懐中時計',
		'良妻賢母',
		'射程距離',
		'痴話喧嘩',
		'最終兵器',
		'価格競争',
		'台風一過',
		'魑魅魍魎'
	];
	var mediator = _.extend({}, Backbone.Events);

	var AppView = Backbone.View.extend({
		el: '#app',
		events: {
			'click .btn-toggle-answer': 'toggleAnswer',
			'click .btn-next-idiom': 'showNextIdiom'
		},
		initialize: function() {
			_.bindAll(this, 'showNextIdiom', 'toggleAnswer');
			this.canvasView = new CanvasView();
			this.btnToggleAnswer = $('btn-toggle-answer');
			this.labels = ['問題を見る', '答えを見る'];

			this.mt = new MersenneTwister();
			var date = new Date();
			this.mt.setSeed(date.getMilliseconds() + 1000 * date.getSeconds() + 100000 * date.getMinutes());

			this.showNextIdiom();
		},
		showNextIdiom: function() {
			idiom = candidates[this.mt.nextInt(candidates.length)];
			var model = new CandidateModel({
				idiom: idiom
			});
			this.canvasView.render(model);
		},
		toggleAnswer: function(e) {
			var $e = $(e.currentTarget);
			$e.text(this.labels[0]);
			this.labels.reverse();
			this.canvasView.toggleImage();

			$e.toggleClass('btn-success btn-warning');
		}
	});

	var CanvasView = Backbone.View.extend({
		el: '#canvas-idiom',
		events: {},
		initialize: function() {
			_.bindAll(this, 'initCanvas', 'render', 'toggleImage');
			this.canvas = document.querySelector("#canvas-idiom");
			this.ctx = this.canvas.getContext("2d");
			this.initCanvas();
		},
		initCanvas: function() {
			this.ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			var w = Math.min($('.canvas-container').width(), 800);
			this.$el.width(w);
		},
		render: function(model) {
			var idiom = model.get('idiom');
			this.initCanvas();
			this.ctx.imageSmoothingEnabled = false;
			this.ctx.textAlign = 'center';
			this.ctx.textBaseline = 'middle';
			this.ctx.font = "192px 'ＭＳ ゴシック'";
			this.ctx.fillStyle = 'rgba(1, 1, 1, 1.0)';
			this.ctx.fillText(idiom, this.canvas.width / 2, this.canvas.height / 2);

			// 2階調化
			var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			CanvasUtil.convertToBnW(imageData, 128);
			this.ctx.putImageData(imageData, 0, 0);

			var answer = this.canvas.toDataURL();

			// 塗りつぶし
			imageData = CanvasUtil.fillColor(1, 1, imageData, {
				red: 1,
				green: 1,
				blue: 1,
				alpha: 1.0
			}, this.canvas);
			this.ctx.putImageData(imageData, 0, 0);

			// 反転
			CanvasUtil.reverseTone(imageData);
			this.ctx.putImageData(imageData, 0, 0);

			// 枠描画
			this.ctx.lineWidth = this.canvas.width / 160;
			var i, w = this.canvas.width / idiom.length, h = this.canvas.height;
			for (i = 0; i < idiom.length; i++) {
				this.ctx.strokeRect(w * i, 0, w, h);
			}

			var filled = this.canvas.toDataURL();

			this.images = [answer, filled];
		},
		toggleImage: function() {
			var img = new Image();
			img.src = this.images[0];
			img.onload = _.bind(function() {
				this.ctx.drawImage(img, 0, 0);
			}, this);
			this.images.reverse();
		}
	});

	var CandidateModel = Backbone.Model.extend({
		defaults: function() {
			return {
				idiom: ''
			};
		}
	});

	window.app = new AppView();
});