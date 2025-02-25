import {CARRIERS, DEFAULT_CARRIERS} from '../carriers.json' assert {type: 'json'};
import './utils/parcel_quick_entry';
import './controls/overrides';
import './controls/multichecksingle';

frappe.provide('cargo_management');

cargo_management = {
	TRANSPORTATIONS: {
		'Sea': {icon: 'ship', color: 'blue'},
		'Air': {icon: 'plane', color: 'red'}
	},

	find_carrier_by_tracking_number(tracking_number) {
		tracking_number = tracking_number.trim().toUpperCase(); // Sanitize field

		let response = {carrier: 'Unknown', search_term: tracking_number, tracking_number}; // Default values

		if (!tracking_number || tracking_number.length <= 6)
			return response; // If data is not returned, fields will be erased. Affected Views: List, Form and QuickEntry

		const carrierRegex = [ // The order matters for USPS and FedEx!
			{carrier: 'UPS',        regex: /^1Z/},
			{carrier: 'SunYou',     regex: /^SY/},       // SYUS & SYAE & SYBA
			{carrier: 'SF Express', regex: /^SF/},
			{carrier: 'Amazon',     regex: /^TBA/},
			//{carrier: 'UniUni',     regex: /^UUS0/},     // 'YunExpress' -> YT, sometimes delivers to UniUni
			{carrier: 'Cainiao',    regex: /^LP00/},     // Cainiao can sometimes track 'Yanwen' and 'SunYou'
			{carrier: 'DHL',        regex: /^.{10}$/},
			{carrier: 'YunExpress', regex: /^YT|^YU00/}, // These are sometimes delivered by 'USPS' and 'OnTrac'
			{carrier: 'OnTrac',     regex: /^1LS|^D100/},
			{carrier: 'Yanwen',     regex: /^ALS00|^S000|^UY/}, // ALS00 is sometimes delivered by 'USPS'. UY ends with 'CZ'
			{carrier: 'Unknown',    regex: /^92(612.{17})$|^420.{5}92(612.{17})$/},       // *92612*90980949456651012 | 42033166*926129*0980949456651012. Start with: 92612 or with zipcode(420xxxxx) can be handled by FedEx or USPS. search_term starts at 612
			{carrier: 'USPS',       regex: /^9(?:.{21}|.{25})$|^420.{5}(9(?:.{21}|.{25}))$/}, // *9*400111108296364807659 | 42033165*9*274890983426386918697. First 8 digits: 420xxxxx(zipcode)
			{carrier: 'FedEx',      regex: /^.{12}$|^612.{17}$|^.{22}([1-9].{11})$/},     // *612*90982157320543198 | 9622001900005105596800*5*49425980480. Last 12 digits is tracking
		]; // FIXME: Sort by the most used Carrier? | FIXME: Add More Carriers: 'LY', 'LB', 'LW' | # FIXME: Move to carriers.json
		// AQ are china Post, LW are USPS
		// 00310202207521313709 for Pitney Bowes

		carrierRegex.find(({carrier, regex}) => {
			const match = tracking_number.match(regex);

			if (match) {
				Object.assign(response, {carrier, search_term: match[1] || match[2] || tracking_number}); // If a captured group exists add it
				return true;
			}
		});

		return response; // If no match is found, default values will be returned.
	},

	icon_html: (icon) => ` <i class="fa fa-${icon}"></i>`, // Watch the first whitespace

	transportation_formatter(transportation) {
		const opts = this.TRANSPORTATIONS[transportation];

		return `<span class="indicator-pill ${opts.color} filterable ellipsis" data-filter="transportation,=,${transportation}">
            <span class="ellipsis">${transportation}${this.icon_html(opts.icon)}</span>
        </span>`; // See more of this on list/list_view.js -> get_indicator_html();
	},
	transportation_indicator(transportation) {
		const opts = this.TRANSPORTATIONS[transportation];

		return `<span class="indicator-pill whitespace-nowrap ${opts.color}" style="margin-left: 10px">
			<span>${transportation}${this.icon_html(opts.icon)}</span>
		</span>`; // See more of this on ui/page.js -> set_indicator() and clear_indicator()
	},

	load_carrier_settings(carrier_id) {
		// Returns Carrier Settings from carrier.json -> Used to build and config Action Buttons in Form
		const {api, tracking_url: main_url, default_carriers: extra_urls = []} = CARRIERS[carrier_id] || {};

		let urls = (main_url) ? [{'title': carrier_id, 'url': main_url}] : [];
		extra_urls.forEach(url_id => urls.push({'title': url_id, 'url': DEFAULT_CARRIERS[url_id]}));

		return {api, urls};
	}
};
// TODO DELETE: asdasd
