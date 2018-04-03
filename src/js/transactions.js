const $elTableHead = $('#thead');
const $elTableBody = $('#tbody');
const $elTablePagination = $('#tpagination');

let table = new Table({
	data: {
		url: '/api/transactions'
	},
	params: {
		// 'transaction_id': {
		// 	title: 'id'
		// },
		'txid': {},
		'receiving_address': {
			head: {
				title: 'receiving address',
			}
		},
		'byteball_address': {
			head: {
				title: 'bb address',
			}
		},
		// 'device_address': {
		// 	title: 'device address'
		// },
		'currency': {},
		'currency_amount': {
			head: {
				title: 'currency amount',
				sort: {
					used: false,
				},
			}
		},
		'tokens': {},
		// 'refunded': {},
		// 'paid_out': {},
		// 'paid_date': {},
		// 'refund_date': {},
		// 'payout_unit': {},
		// 'refund_txid': {},
		'stable': {
			body: {
				format: (val) => {
					return val === 1 ? 'true' : 'false';
				}
			}
		},
		'creation_date': {
			head: {
				title: 'created',
				sort: {
					used: true,
				},
			}
		},
		// 'block_number': {},
	}
}, $elTableHead, $elTableBody, $elTablePagination);
window.table = table;

window.onpopstate = (event) => {
	if (table.checkIsWasChangedUrlParams()) {
		table.loadData();
	}
};

table.checkIsWasChangedUrlParams();
table.createHeader();
table.createPagination();

$(() => {
	table.loadData();
});