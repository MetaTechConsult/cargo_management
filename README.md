## ERPNext Cargo Management

---

**ERPNext Cargo Management is a fully-fledged ERPNext solution designed for freight forwarding companies.**

It streamlines logistics processes, including **package tracking**, **invoicing**, and **warehouse management**,
providing a seamless, efficient, and user-friendly experience.

Built on [Frappe Framework v15](https://github.com/frappe/frappe/) and [ERPNext](https://github.com/frappe/erpnext),
this solution is designed to meet the unique needs of businesses in the freight forwarding industry.  
It leverages core functionalities from ERPNext, such as Accounting, Stock, HR, Assets, Payroll and more.

## Key Features

- **Parcel Management**: Manages the packages, integrates tracking APIs and handles notifications.
- **Warehouse Management:** Handles the receipt of packages in warehouses.
- **Shipment Management:** Manages shipments and receipts, also generates packing lists for each shipment.
- **Selling Management:** Customizes ERPNext modules for invoicing packages and managing customer import orders.
- **Support Management**: Customizes ERPNext modules for customer support related to packages and orders.
- **Custom Views**:
    - **Workspaces, Dashboard Views, Settings**
    - **Reports**: Provides insightful reports for better decision-making and business analysis.
- **External APIs For Tracking Packages**:
    - [EasyPost](https://www.easypost.com/tracking-guide) ([Source Code](https://github.com/EasyPost/easypost-python))
    - [17Track](https://api.17track.net)

### Extra Addons

- [ERPNext Delivery Management](https://github.com/AgileShift/erpnext_delivery) - WORK on Progress
- [Frappe Nextcloud](https://github.com/AgileShift/frappe_nextcloud) - WORK on Progress

### List of Carriers Currently Supported:
Last checked: 8 September 2023

| Carrier    |    EasyPost    | 17Track |
|:-----------|:--------------:|:-------:|
| Amazon     |       ❌️       |   ✅️    |
| USPS       |       ✅️       |   ✅️    |
| UPS        |       ✅️       |   ✅️    |
| DHL        |       ✅️       |   ✅️    |
| FedEx      | ❗️With Account |   ✅️    |
| OnTrac     | ❗️With Account |   ✅️    |
| SF Express | ❗️With Account |   ✅️    |
| Yanwen     |   ⁉️ Limited   |   ✅️    |
| Cainiao    | ❌️ Deprecated  |   ✅️    |
| YunExpress | ❌️ Deprecated  |   ✅️    |
| SunYou     |       ❌️       |   ✅️    |

---

### Configuration of API Keys and Webhooks for EasyPost and 17Track

#### EasyPost Configuration

1. Get Your [EasyPost API Key](https://www.easypost.com/docs/api#authentication)
2. Set the **API Key**: `$ bench set-config easypost_api_key API_KEY`
3. Create and set your **Webhook Secret**(hmac): `$ bench set-config easypost_webhook_secret SECRET`
4. Set up your **Webhook Secret** and the **Webhook URL** on EasyPost: `{HOST}/api/method/cargo_management.parcel_management.doctype.parcel.api.easypost_api.easypost_webhook`


#### 17Track Configuration

1. Get Your [17Track Security Key](https://api.17track.net/en/doc?anchor=get-security-key)
2. Set the **API Key**: `$ bench set-config 17track_api_key API_KEY`
3. Set up the **Webhook URL** on 17Track: `{HOST}/api/method/cargo_management.parcel_management.doctype.parcel.api.17track_api.17track_webhook`




# TODO: WORKING

### Parcel Flow
1. **Parcels** are created and can be related to a specific customer
   1. Content of the package can be added and its related Item for invoice Purposes.
   2. It can be tracked by the API or not.
2. As the carrier updates the details the Tracking API send it via a webhook, we gather and update.
3. When the package is marked as delivered at warehouse by the carrier we stop the Tracking API webhook updates
4. A **Warehouse Receipt** doc its created to link the received package:
   1. Package related fields can be filled by the Warehouse: Content, Dimensions, Weight, Receipt Date
5. **Cargo Shipment** is created to export Packages in bulk:
   1. Warehouse Receipts are added in them.
   2. Related information: Transportation Type, Departure date, Est Arrival Date, Dimensions, Gross Weight

# WORKING on this flow
6. **Cargo Shipment Receipt** is created to receive the Cargo Shipment:
   1. A Receipt loads the data of all related **Packages** in the **Cargo Shipment** through the **Warehouse Receipts**
   2. All **Packages** are sorted by **Customer**, and its the moment to set all related data to Create Invoices.
   3. When all the **Packages** have been processed, the **Sales Invoices** can be created.
      1. A **Sales invoice** will be created for the customer, it will contain all the related **Packages**.
7. WORKING





### Customizations to Frappe and ERPNext:
# WORK ON PROGRESS
- Selling:
  - Quotation
  - Sales Invoice are used to invoice for Logistic services and items related to Business
  - Sales Order are the only choice to make purchases online on behalf of the customer:
    - WORKING(We must link the sales order with the package and content, later we must invoice the order and service.)
- Package can be linked in Issue:
  - WORKING(on the change of status)
- The customizations allow us to:
  - Invoice a **Customer** for the Logistic Services and Products in Stock offered.
  - Link the **Sales Invoice** with a Package and update its statuses.


#### Helpers
- **Cargo Packing List**: is a "Packing List" for the **Cargo Shipment**:
  1. Gets all the content declared by the **Customer** and the content declared by the **Warehouse** of the packages in a **Cargo Shipment**
  2. It allows to modify the content and amount declared only for Print.
  3. WORKING

## This is work in progress. But it's stable for usage
- WORKING
  1. Packing Slip for customs:
  2. Fetching data of prices and quotations from packages to Cargo Shipment Receipt: WORKING
- FUTURE:
  1. Setting data of prices in CSR to Sales Invoice
  2. Working in the Sales Orders!



##### Code related TODO:
2. Migrate SQL to QueryBuilder? usign Pypika?
