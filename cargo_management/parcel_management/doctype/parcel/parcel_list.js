frappe.listview_settings['Parcel'] = {

	// TODO DELETE: 'consolidated_tracking_numbers' 12 Matches

	add_fields: ['carrier'],
	filters: [['status', 'not in', ['Finished', 'Cancelled', 'Never Arrived', 'Returned to Sender']]],  // aka 'Active Parcels'

	onload(listview) {
		const {name: name_field, tracking_number: tracking_number_field, customer_name: customer_name_field} = listview.page.fields_dict;

		// The 'tracking_number' field is set because is the title field of the Doctype. So we remove from the 'standard_filters'
		tracking_number_field.wrapper.remove();

		// Set 'name' field tooltip and placeholder to match 'tracking_number' field
		name_field.wrapper.setAttribute('data-original-title', tracking_number_field.df.label);
		name_field.input.setAttribute('placeholder', tracking_number_field.df.placeholder);

		// Override: onchange() method set in frappe/list/base_list.js -> make_standard_filters()
		name_field.df.onchange = customer_name_field.df.onchange = function () {
			// Remove '%' added in frappe/list/base_list.js -> get_standard_filters() when the listview loads and update both UI and internal values
			this.value = this.input.value = this.get_input_value().replaceAll('%', '').trim().toUpperCase(); // this.set_input() is not working

			if (this.value !== this.last_value) {
				listview.filter_area.refresh_list_view(); // refresh_list_view() if the value has changed
			}
		};

		/* Override to add 'or_filters'. FIXME: Will be better to have it on backend to solve: gets_args + get_count_str + get_stats
		 * frappe hook: 'permission_query_conditions' Wont work, It get called after we have build the frappe
		 * check this: override_whitelisted_methods. The problem is this method is HEAVILY used
		 * TODO: listview.get_count_str() => This call frappe.db.count() using 'filters' not 'or_filters'
		 * TODO: listview.list_sidebar.get_stats() => This call frappe.desk.reportview.get_sidebar_stats using 'filters' not 'or_filters' */
		listview.get_args = function () {
			let args = frappe.views.ListView.prototype.get_args.call(listview);  // Calling his super for the args

			const name_filter = args.filters.findIndex(f => f[1] === 'name');  // f -> ['Doctype', 'field', 'sql_search_term', 'value']

			if (name_filter >= 0) {  // We have 'name' filter being filtered. -> name_filter will contain index if found
				args.filters.splice(name_filter, 1);  // Removing 'name' filter from 'filters'. It's a 'standard_filter'

				const search_term = cargo_management.find_carrier_by_tracking_number(name_field.get_input_value()).search_term;

				// TODO: WORK -> We will not use the main field from now on
				args.or_filters = ['name', 'tracking_number'].map(field => [
					args.doctype, field, 'like', '%' + search_term + '%'
				]); // Mapping each field to 'or_filters' for the necessary fields to search
				args.or_filters.push(['Parcel Content', 'tracking_number', 'like', '%' + search_term + '%'])  // This acts as a consolidated tracking number
			}

			return args;
		};
    },

	// Unused: Light Blue. // TODO: Migrate to Document States? Maybe when frappe core starts using it.
	get_indicator: (doc) => [__(doc.status), {
		'Awaiting Receipt': 'blue',
		'Awaiting Confirmation': 'orange',
		'In Extraordinary Confirmation': 'pink',
		'Awaiting Departure': 'yellow',
		'In Transit': 'purple',
		'In Customs': 'gray',
		'Sorting': 'green',
		'To Bill': 'green',
		'Unpaid': 'red',
		'For Delivery or Pickup': 'cyan',
		'Finished': 'darkgrey',
		'Cancelled': 'red',
		'Never Arrived': 'red',
		'Returned to Sender': 'red',
	}[doc.status], 'status,=,' + doc.status],

	button: {
		show: () => true,
		get_label: () => __('Search'),
		get_description: () => '',
		action(doc) {
			let fields = [...this.build_carrier_urls(__('Tracking Number'), doc.tracking_number, doc.carrier)];

			if (doc.name !== doc.tracking_number) {
				fields.unshift(...this.build_carrier_urls(__('Name'), doc.name));
			}

			if (doc.consolidated_tracking_numbers) {
				doc.consolidated_tracking_numbers.split('\n').forEach((tracking_number, i) => {
					fields.push(...this.build_carrier_urls(__('Consolidated #{0}', [i + 1]), tracking_number));
				});
			}

			new frappe.ui.Dialog({animate: false, size: 'small', indicator: 'green', title: this.get_label, fields: fields}).show();
		},
		build_carrier_urls(section_label, lookup_field, carrier = null) {
			carrier = carrier || cargo_management.find_carrier_by_tracking_number(lookup_field).carrier;

			let fields = [{fieldtype: 'Section Break', label: `${section_label}(${carrier}): ${lookup_field}`}];
			const urls = cargo_management.load_carrier_settings(carrier).urls;

			urls.forEach((url, i) => {
				fields.push({
					fieldtype: 'Button', label: url.title, input_class: "btn-block btn-primary",  // FIXME: btn-default
					click: () => window.open(url.url + lookup_field)
				});

				if (i < urls.length - 1) {
					fields.push({fieldtype: 'Column Break'});
				}
			});

			return fields;
		}
	},

	formatters: {
		transportation: (value) => cargo_management.transportation_formatter(value),
		name: (value, df, doc) => (value !== doc.tracking_number) ? `<b>${value}</b>` : ''
	}
};
// 111
