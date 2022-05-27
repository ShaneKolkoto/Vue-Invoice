<template>
  <div>
    <div v-if="currentInvoice" class="invoice-view container">
      <router-link class="nav-link flex" :to="{ name: 'Home' }">
        <img src="@/assets/icon-arrow-left.svg" alt="" /> Go Back
      </router-link>
      <!-- Header -->
      <div class="header flex">
        <div class="left flex">
          <span>Status</span>
          <div
            class="status-button flex"
            :class="{
              paid: currentInvoice.invoicePaid,
              draft: currentInvoice.invoiceDraft,
              pending: currentInvoice.invoicePending,
            }"
          >
            <div class="invoice-status">
              <span v-if="currentInvoice.invoicePaid">Paid</span>
              <span v-if="currentInvoice.invoiceDraft">Draft</span>
              <span v-if="currentInvoice.invoicePending">Pending</span>
            </div>
          </div>
        </div>
        <div class="right flex">
          <button @click="toggleEditInvoice" class="dark-purple">Edit</button>
          <button @click="deleteInvoice(currentInvoice.docId)" class="red">
            Delete
          </button>
          <button
            @click="updateStatusToPaid(currentInvoice.docId)"
            v-if="currentInvoice.invoicePending"
            class="green"
          >
            Mark as Paid
          </button>
          <button
            v-if="currentInvoice.invoiceDraft || currentInvoice.invoicePaid"
            @click="updateStatusToPending(currentInvoice.docId)"
            class="orange"
          >
            Mark as Pending
          </button>
        </div>
      </div>

      <!-- Invoice Details -->
      <div id="invoice" class="invoice-details flex flex-column">
        <div class="top flex">
          <div class="left flex flex-column">
            <p class="invoice_no">
              <span>#</span>{{ currentInvoice.invoiceId }}
            </p>
            <p>{{ currentInvoice.productDescription }}</p>
          </div>
          <div class="right flex flex-column">
            <p>{{ currentInvoice.billerStreetAddress }}</p>
            <p>{{ currentInvoice.billerCity }}</p>
            <p>{{ currentInvoice.billerZipCode }}</p>
            <p>{{ currentInvoice.billerCountry }}</p>
          </div>
        </div>
        <div class="middle flex">
          <div class="payment flex flex-column">
            <h4>Invoice Date</h4>
            <p>
              {{ currentInvoice.invoiceDate }}
            </p>
            <h4>Payment Date</h4>
            <p>
              {{ currentInvoice.paymentDueDate }}
            </p>
          </div>
          <div class="bill flex flex-column">
            <h4>Bill To</h4>
            <p>{{ currentInvoice.clientName }}</p>
            <p>{{ currentInvoice.clientStreetAddress }}</p>
            <p>{{ currentInvoice.clientCity }}</p>
            <p>{{ currentInvoice.clientZipCode }}</p>
            <p>{{ currentInvoice.clientCountry }}</p>
          </div>
          <div class="send-to flex flex-column">
            <h4>Sent To</h4>
            <p>{{ currentInvoice.clientEmail }}</p>
          </div>
        </div>
        <div class="bottom flex flex-column">
          <div class="billing-items">
            <div class="heading flex">
              <p>Item Name</p>
              <p>QTY</p>
              <p>Price (ZAR)</p>
              <p>Total (ZAR)</p>
            </div>
            <div
              v-for="(item, index) in currentInvoice.invoiceItemList"
              :key="index"
              class="item flex"
            >
              <p>{{ item.itemName }}</p>
              <p>{{ item.qty }}</p>
              <p>{{ item.price }}</p>
              <p>{{ item.total }}</p>
            </div>
          </div>
          <div class="total flex">
            <p>Amount Due</p>
            <p>R {{ currentInvoice.invoiceTotal }}</p>
          </div>
        </div>
      </div>
      <button
        class="btn btn-primary"
        @click="printDocument()"
        style="color: black"
      >
        Export To PDF
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from "vuex";
import pdfMake from "pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import store from "../store/index";
import moment from "moment";
// import htmlToPdfmake from "html-to-pdfmake";
export default {
  name: "invoiceView",
  data() {
    return {
      currentInvoice: null,
      status: "Pending",
    };
  },
  created() {
    this.getCurrentInvoice();
  },
  methods: {
    ...mapMutations([
      "SET_CURRENT_INVOICE",
      "TOGGLE_EDIT_INVOICE",
      "TOGGLE_INVOICE",
    ]),

    ...mapActions([
      "DELETE_INVOICE",
      "UPDATE_STATUS_TO_PENDING",
      "UPDATE_STATUS_TO_PAID",
    ]),

    getFields(input, field) {
      console.log(input);
      console.log(field);
      var output = [];
      for (var i = 0; i < input.length; ++i)
        output.push(input[i][field] + `\n`);
      // return "line1" + "\n" + "line2";
      // [0:{} 1:{}] loop return add break
      // console.log(output);
      return output;
    },

    currentStatus() {
      if (store.state.currentInvoiceArray[0].invoicePending === true) {
        return this.status;
      } else if (store.state.currentInvoiceArray[0].invoicePaid === true) {
        this.status = "Paid";
      }
    },

    printDocument() {
      //get table html
      // const pdfTable = document.getElementById("invoice");
      // const pdfStatus = document.getElementById("invoice-status");
      // console.log(pdfStatus[0]);
      //html to pdf format
      const documentDefinition = {
        info: {
          title: `Invoice-${store.state.currentInvoiceArray[0].docId}`,
          author: "L&G Precisions",
        },
        content: [
          {
            columns: [
              {
                image:
                  "data:image/png;base64,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",
                width: 150,
              },
              [
                {
                  text: "Receipt",
                  color: "#333333",
                  width: "*",
                  fontSize: 28,
                  bold: true,
                  alignment: "right",
                  margin: [0, 0, 0, 15],
                },
                {
                  stack: [
                    {
                      columns: [
                        {
                          text: "Receipt No.",
                          color: "#aaaaab",
                          bold: true,
                          width: "*",
                          fontSize: 12,
                          alignment: "right",
                        },
                        {
                          text: `${store.state.invoiceData.length}`,
                          bold: true,
                          color: "#333333",
                          fontSize: 12,
                          alignment: "right",
                          width: 100,
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: "Date Issued",
                          color: "#aaaaab",
                          bold: true,
                          width: "*",
                          fontSize: 12,
                          alignment: "right",
                        },
                        {
                          text: `${moment().format("ll")}`,
                          bold: true,
                          color: "#333333",
                          fontSize: 12,
                          alignment: "right",
                          width: 100,
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: "Status",
                          color: "#aaaaab",
                          bold: true,
                          fontSize: 12,
                          alignment: "right",
                          width: "*",
                        },
                        {
                          text: `${this.status}`,
                          bold: true,
                          fontSize: 14,
                          alignment: "right",
                          color: "green",
                          width: 100,
                        },
                      ],
                    },
                  ],
                },
              ],
            ],
          },
          {
            columns: [
              {
                text: "From",
                color: "#aaaaab",
                bold: true,
                fontSize: 14,
                alignment: "left",
                margin: [0, 20, 0, 5],
              },
              {
                text: "To",
                color: "#aaaaab",
                bold: true,
                fontSize: 14,
                alignment: "left",
                margin: [0, 20, 0, 5],
              },
            ],
          },
          {
            columns: [
              {
                text: `Enter Company Name \n Enter Company Email`,
                bold: true,
                color: "#333333",
                alignment: "left",
              },
              {
                text: `${store.state.currentInvoiceArray[0].clientName} \n ${store.state.currentInvoiceArray[0].clientEmail}`,
                bold: true,
                color: "#333333",
                alignment: "left",
              },
            ],
          },
          {
            columns: [
              {
                text: `Address`,
                color: "#aaaaab",
                bold: true,
                margin: [0, 7, 0, 3],
              },
              {
                text: `Address`,
                color: "#aaaaab",
                bold: true,
                margin: [0, 7, 0, 3],
              },
            ],
          },
          {
            columns: [
              {
                text: `${store.state.currentInvoiceArray[0].billerStreetAddress} \n ${store.state.currentInvoiceArray[0].billerCity} ${store.state.currentInvoiceArray[0].billerZipCode} \n ${store.state.currentInvoiceArray[0].billerCountry}`,
                style: "invoiceBillingAddress",
              },
              {
                text: `${store.state.currentInvoiceArray[0].clientStreetAddress} \n ${store.state.currentInvoiceArray[0].clientCity} ${store.state.currentInvoiceArray[0].clientZipCode} \n ${store.state.currentInvoiceArray[0].clientCountry}`,
                style: "invoiceBillingAddress",
              },
            ],
          },
          "\n\n",
          {
            width: "100%",
            alignment: "center",
            text: `Invoice No - ${store.state.currentInvoiceArray[0].invoiceId}`,
            bold: true,
            margin: [0, 10, 0, 10],
            fontSize: 15,
          },
          {
            table: {
              // headers are automatically repeated if the table spans over multiple pages
              // you can declare how many rows should be treated as headers
              headerRows: 1,
              widths: ["*", "auto", 100, "*"],

              body: [
                [
                  {
                    text: "ITEM DESCRIPTION",
                    fillColor: "#eaf2f5",
                    border: [false, true, false, true],
                    margin: [0, 5, 0, 5],
                    textTransform: "uppercase",
                  },
                  {
                    text: "ITEM QTY",
                    border: [false, true, false, true],
                    alignment: "center",
                    fillColor: "#eaf2f5",
                    margin: [0, 5, 0, 5],
                    textTransform: "uppercase",
                  },
                  {
                    text: "UNIT Price",
                    border: [false, true, false, true],
                    alignment: "right",
                    fillColor: "#eaf2f5",
                    margin: [0, 5, 0, 5],
                    textTransform: "uppercase",
                  },
                  {
                    text: "ITEM TOTAL",
                    border: [false, true, false, true],
                    alignment: "right",
                    fillColor: "#eaf2f5",
                    margin: [0, 5, 0, 5],
                    textTransform: "uppercase",
                  },
                ],
                [
                  {
                    text: this.getFields(
                      store.state.currentInvoiceArray[0].invoiceItemList,
                      "itemName"
                    ),
                    border: [false, false, false, true],
                    margin: [0, 5, 0, 5],
                    alignment: "left",
                  },
                  {
                    text: this.getFields(
                      store.state.currentInvoiceArray[0].invoiceItemList,
                      "qty"
                    ),
                    border: [false, false, false, true],
                    margin: [0, 5, 0, 5],
                    alignment: "right",
                  },
                  {
                    text: this.getFields(
                      store.state.currentInvoiceArray[0].invoiceItemList,
                      "price"
                    ),
                    border: [false, false, false, true],
                    margin: [0, 5, 0, 5],
                    alignment: "right",
                  },
                  {
                    text: this.getFields(
                      store.state.currentInvoiceArray[0].invoiceItemList,
                      "total"
                    ),
                    border: [false, false, false, true],
                    margin: [0, 5, 0, 5],
                    alignment: "right",
                  },
                ],
                // [{ text: "Bold value", bold: true }, "Val 2", "Val 3", "Val 4"],
              ],
            },
          },
          "\n",
          "\n\n",
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto"],
              body: [
                [
                  {
                    text: "Payment Subtotal",
                    border: [false, true, false, true],
                    alignment: "right",
                    margin: [0, 5, 0, 5],
                  },
                  {
                    border: [false, true, false, true],
                    text: store.state.currentInvoiceArray[0].invoiceTotal,
                    alignment: "right",
                    fillColor: "#f5f5f5",
                    margin: [0, 5, 0, 5],
                  },
                ],
                // Need to include Vat fuction calculation
                // [
                //   {
                //     text: "Payment Processing Fee (VAT)",
                //     border: [false, false, false, true],
                //     alignment: "right",
                //     margin: [0, 5, 0, 5],
                //   },
                //   {
                //     text: "Calculate function with tax or without tax",
                //     border: [false, false, false, true],
                //     fillColor: "#f5f5f5",
                //     alignment: "right",
                //     margin: [0, 5, 0, 5],
                //   },
                // ],
                [
                  {
                    text: "Total Amount",
                    bold: true,
                    fontSize: 20,
                    alignment: "right",
                    border: [false, false, false, true],
                    margin: [0, 5, 0, 5],
                  },
                  {
                    text: `R ${store.state.currentInvoiceArray[0].invoiceTotal}`,
                    bold: true,
                    fontSize: 20,
                    alignment: "right",
                    border: [false, false, false, true],
                    fillColor: "#f5f5f5",
                    margin: [0, 5, 0, 5],
                  },
                ],
              ],
            },
          },
          "\n\n",
          {
            text: "NOTES",
            style: "notesTitle",
          },
          {
            text: store.state.currentInvoiceArray[0].productDescription,
            style: "notesText",
          },
        ],
        styles: {
          notesTitle: {
            fontSize: 10,
            bold: true,
            margin: [0, 50, 0, 3],
          },
          notesText: {
            fontSize: 10,
          },
        },
        defaultStyle: {
          columnGap: 20,
          //font: 'Quicksand',
        },
        // ],
      };

      const myTableLayouts = {
        exampleLayout: {
          hLineWidth: function (i, node) {
            console.log(i, node);
            if (i === 0 || i === node.table.body.length) {
              return 0;
            }
            return i === node.table.headerRows ? 2 : 1;
          },
          vLineWidth: function (i) {
            console.log(i);
            return 0;
          },
          hLineColor: function (i) {
            return i === 1 ? "black" : "#aaa";
          },
          paddingLeft: function (i) {
            return i === 0 ? 0 : 8;
          },
          paddingRight: function (i, node) {
            return i === node.table.widths.length - 1 ? 0 : 8;
          },
        },
      };

      // download the PDF
      pdfMake.vfs = pdfFonts.pdfMake.vfs;
      pdfMake
        .createPdf(documentDefinition, { tableLayouts: myTableLayouts })
        .open();
    },

    getCurrentInvoice() {
      this.SET_CURRENT_INVOICE(this.$route.params.invoiceId);
      this.currentInvoice = this.currentInvoiceArray[0];
    },

    toggleEditInvoice() {
      this.TOGGLE_EDIT_INVOICE();
      this.TOGGLE_INVOICE();
    },

    async deleteInvoice(docId) {
      await this.DELETE_INVOICE(docId);
      this.$router.push({ name: "Home" });
    },

    updateStatusToPaid(docId) {
      this.UPDATE_STATUS_TO_PAID(docId);
    },

    updateStatusToPending(docId) {
      this.UPDATE_STATUS_TO_PENDING(docId);
    },
  },
  computed: {
    ...mapState(["currentInvoiceArray", "editInvoice"]),
  },
  watch: {
    editInvoice() {
      if (!this.editInvoice) {
        this.currentInvoice = this.currentInvoiceArray[0];
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.invoice-view {
  .nav-link {
    margin-bottom: 32px;
    align-items: center;
    color: #fff;
    font-size: 12px;
    img {
      margin-right: 16px;
      width: 7px;
      height: 10px;
    }
  }

  .header,
  .invoice-details {
    background-color: #1e2139;
    border-radius: 20px;
  }

  .header {
    align-items: center;
    padding: 24px 32px;
    font-size: 12px;

    .left {
      align-items: center;

      span {
        color: #dfe3fa;
        margin-right: 16px;
      }
    }

    .right {
      flex: 1;
      justify-content: flex-end;

      button {
        color: #fff;
      }
    }
  }

  .invoice-details {
    padding: 48px;
    margin-top: 24px;

    .top {
      div {
        color: #dfe3fa;
        flex: 1;
      }

      .left {
        font-size: 12px;
        p:first-child {
          font-size: 24px;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 8px;
        }

        p:nth-child(2) {
          font-size: 16px;
        }

        span {
          color: #888eb0;
        }
      }

      .right {
        font-size: 12px;
        align-items: flex-end;
      }
    }

    .middle {
      margin-top: 50px;
      color: #dfe3fa;
      gap: 16px;

      h4 {
        font-size: 12px;
        font-weight: 400;
        margin-bottom: 12px;
      }

      p {
        font-size: 16px;
      }

      .bill,
      .payment {
        flex: 1;
      }

      .payment {
        h4:nth-child(3) {
          margin-top: 32px;
        }

        p {
          font-weight: 600;
        }
      }

      .bill {
        p:nth-child(2) {
          font-size: 16px;
        }
        p:nth-child(3) {
          margin-top: auto;
        }

        p {
          font-size: 12px;
        }
      }

      .send-to {
        flex: 2;
      }
    }

    .bottom {
      margin-top: 50px;

      .billing-items {
        padding: 32px;
        border-radius: 20px 20px 0 0;
        background-color: #252945;

        .heading {
          color: #dfe3fa;
          font-size: 12px;
          margin-bottom: 32px;

          p:first-child {
            flex: 3;
            text-align: left;
          }

          p {
            flex: 1;
            text-align: right;
          }
        }

        .item {
          margin-bottom: 32px;
          font-size: 13px;
          color: #fff;

          &:last-child {
            margin-bottom: 0;
          }

          p:first-child {
            flex: 3;
            text-align: left;
          }

          p {
            flex: 1;
            text-align: right;
          }
        }
      }

      .total {
        color: #fff;
        padding: 32px;
        background-color: rgba(12, 14, 22, 0.7);
        align-items: center;
        border-radius: 0 0 20px 20px;

        p {
          flex: 1;
          font-size: 12px;
        }

        p:nth-child(2) {
          font-size: 28px;
          text-align: right;
        }
      }
    }
  }
}
</style>
