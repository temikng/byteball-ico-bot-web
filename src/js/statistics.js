const DATE_FORMAT = 'YYYY-MM-DD';
const $elDateFrom = $('#t_f_df');
const $elDateTo = $('#t_f_dt');

const $elTableHead = $('#thead');
const $elTableBody = $('#tbody');
// const $elTablePagination = $('#tpagination');

let table = new Table({
	data: {
		url: '/api/statistic',
		sort: 'date',
		filterFormat: {
			f_df: (val) => val && val.format(DATE_FORMAT),
			f_dt: (val) => val && val.format(DATE_FORMAT)
		},
		jsonUrlFilterFormat: {
			f_df: {
				toStr: (val) => val && val.format(DATE_FORMAT),
				toVal: (val) => {
					try {
						return moment(val);
					} catch (e) {
						return moment().subtract(1, 'years')
					}
				},
				update: (val) => {

				}
			},
			f_dt: {
				toStr: (val) => val && val.format(DATE_FORMAT),
				toVal: (val) => {
					try {
						return moment(val);
					} catch (e) {
						let now = new Date();
						now.setHours(0,0,0,0);
						return moment(now);
					}
				},
				update: (val) => {

				}
			}
		}
	},
	params: {
		'date': {
			head: {
				sort: {
					used: true,
				},
			}
		},
		'count': {},
		'sum': {},
	}
}, $elTableHead, $elTableBody);
window.table = table;

window.onpopstate = (event) => {
	if (table.checkIsWasChangedUrlParams()) {
		table.loadData();
	}
};

table.checkIsWasChangedUrlParams();
initRangeDatePicker();
table.createHeader();
table.createPagination();

$(() => {
	table.loadData();
});

function initRangeDatePicker() {
	let defaultDatepickerOptions = {
		todayBtn: true,
		autoclose: true,
	};

	// console.log('table.data.filter', table.data);
	if (!table.data.filter.f_df) {
		table.data.filter.f_df = moment(table.data.filter.f_dt ? table.data.filter.f_dt : undefined).subtract(1, 'years');
	}
	if (!table.data.filter.f_dt) {
		let now = new Date();
		now.setHours(0,0,0,0);
		table.data.filter.f_dt = moment(now);
	}

	$elDateFrom.datepicker(Object.assign({
		endDate: table.data.filter.f_dt.toDate(),
	}, defaultDatepickerOptions)).on('changeDate', (ev) => {
		// console.log('change date from', ev);
		table.data.filter.f_df = moment(ev.date.valueOf());
		$elDateTo.datepicker('setStartDate', table.data.filter.f_df.toDate());
		table.loadData();
	});
	$elDateFrom.datepicker('update', table.data.filter.f_df.toDate());

	$elDateTo.datepicker(Object.assign({
		startDate: table.data.filter.f_df.toDate(),
		endDate: table.data.filter.f_dt.toDate(),
	}, defaultDatepickerOptions)).on('changeDate', (ev) => {
		// console.log('change date to', ev);
		table.data.filter.f_dt = moment(ev.date.valueOf());
		$elDateFrom.datepicker('setEndDate', table.data.filter.f_dt.toDate());
		table.loadData();
	});
	$elDateTo.datepicker('update', table.data.filter.f_dt.toDate());
}