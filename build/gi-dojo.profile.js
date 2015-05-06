dependencies = {
	layers: [
		{
			name: "../dijit/dijit.js",
			dependencies: [
				"dijit.dijit",
				"dojox.html._base"
			]
		},
		{
			name: "../dijit/Editor.js",
			layerDependencies : [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.Editor"
			]
		},
		{
			name: "../dijit/form/Button.js",
			layerDependencies : [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.form.Button"
			]
		},
		{
			name: "../dijit/form/CheckBox.js",
			layerDependencies : [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.form.CheckBox"
			]
		},
		{
			name: "../dijit/ColorPalette.js",
			layerDependencies: [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.ColorPalette"
			]
		},
		{
			name: "../dijit/form/ValidationTextBox.js",
			layerDependencies: [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.form.ValidationTextBox"
			]
		},
		{
			name: "../dijit/form/_DateTimeTextBox.js",
			layerDependencies: [
				"../dijit/dijit.js",
				"../dijit/form/ValidationTextBox.js"
			],
			keepRequires : [
				"dijit.form.ValidationTextBox"
			],
			dependencies: [
				"dijit.form._DateTimeTextBox"
			]
		},
		{
			name: "../dijit/form/DateTextBox.js",
			layerDependencies: [
				"../dijit/dijit.js",
				"../dijit/form/_DateTimeTextBox.js"
			],
			keepRequires : [
				"dijit.form._DateTimeTextBox"
			],
			dependencies: [
				"dijit.form.DateTextBox",
			]
		},
		{
			name: "../dijit/form/TimeTextBox.js",
			layerDependencies: [
				"../dijit/dijit.js",
				"../dijit/form/_DateTimeTextBox.js"
			],
			keepRequires : [
				"dijit.form._DateTimeTextBox"
			],
			dependencies: [
				"dijit.form.TimeTextBox"
			]
		},
		{
			name: "../dijit/form/NumberTextBox.js",
			layerDependencies: [
				"../dijit/dijit.js",
				"../dijit/form/ValidationTextBox.js"
			],
			keepRequires : [
				"dijit.form.ValidationTextBox"
			],
			dependencies: [
				"dijit.form.NumberTextBox"
			]
		},
		{
			name: "../dijit/form/CurrencyTextBox.js",
			layerDependencies: [
				"../dijit/dijit.js",
				"../dijit/form/NumberTextBox.js"
			],
			keepRequires : [
				"dijit.form.NumberTextBox"
			],
			dependencies: [
				"dojo.i18n",
				"dijit.form.CurrencyTextBox"
			]
		},
		{
			name: "../dijit/form/NumberSpinner.js",
			layerDependencies: [
				"../dijit/dijit.js",
				"../dijit/form/NumberTextBox.js"
			],
			keepRequires : [
				"dijit.form.ValidationTextBox",
				"dijit.form.NumberTextBox"
			],
			dependencies: [
				"dijit.form._Spinner",
				"dijit.form.NumberSpinner"
			]
		},
		{
			name: "../dijit/form/HorizontalSlider.js",
			layerDependencies : [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.form.HorizontalSlider"
			]
		},
		{
			name: "../dijit/form/VerticalSlider.js",
			layerDependencies: [
				"../dijit/dijit.js",
				"../dijit/form/HorizontalSlider.js"
			],
			keepRequires : [
				"dijit.form.HorizontalSlider"
			],
			dependencies: [
				"dijit.form.VerticalSlider"
			]
		},
		{
			name: "../dijit/ProgressBar.js",
			layerDependencies : [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dijit.ProgressBar"
			]
		},
		{
			name: "../dojox/form/Rating.js",
			layerDependencies : [
				"../dijit/dijit.js"
			],
			dependencies: [
				"dojox.form.Rating"
			]
		},
		{
			name: "../gi-dijits-all.js",
			dependencies: [
				"dijit.Editor",
				"dijit.form.Button",
				"dijit.form.CheckBox",
				"dijit.form.DateTextBox",
				"dijit.form.TimeTextBox",
				"dijit.ColorPalette",
				"dijit.ProgressBar",
				"dijit.form.CurrencyTextBox",
				"dijit.form.NumberSpinner",
				"dijit.form.VerticalSlider",
				"dojox.form.Rating"
			]
		},
    {
      name: "../dojox/xmpp/xmppSession.js",
      dependencies: [
        'dojox.xmpp.xmppSession'
      ]
    }
	],

	prefixes: [
		[ "dijit", "../dijit" ],
		[ "dojox", "../dojox" ]
	]
}
