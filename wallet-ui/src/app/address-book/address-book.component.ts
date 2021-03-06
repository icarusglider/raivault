import { Component, OnInit } from '@angular/core';
import {AddressBookService} from "../address-book.service";
import {NotificationService} from "../notification.service";
import {WalletService} from "../wallet.service";
import {ModalService} from "../modal.service";

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css']
})
export class AddressBookComponent implements OnInit {

  activePanel = 0;

  addressBook$ = this.addressBookService.addressBook$;
  newAddressAccount = '';
  newAddressName = '';

  constructor(private addressBookService: AddressBookService, private walletService: WalletService, private notificationService: NotificationService, public modal: ModalService) { }

  async ngOnInit() {
    const book = await this.addressBookService.loadAddressBook();
  }

  async saveNewAddress() {
    if (!this.newAddressAccount || !this.newAddressName) return this.notificationService.sendError(`Account and name are required`);

    // Make sure name doesn't exist
    if (this.addressBookService.nameExists(this.newAddressName)) {
      return this.notificationService.sendError(`This name is already in use!  Please use a unique name`);
    }

    // Make sure the address is valid
    const valid = await this.walletService.walletApi.validateAccountNumber(this.newAddressAccount);
    if (!valid || valid.valid !== '1') return this.notificationService.sendWarning(`Account ID is not a valid account`);

    try {
      await this.addressBookService.saveAddress(this.newAddressAccount, this.newAddressName);
      this.notificationService.sendSuccess(`Successfully created new name for account!`);
      this.cancelNewAddress();
    } catch (err) {
      this.notificationService.sendError(`Unable to save entry: ${err.message}`)
    }
  }

  cancelNewAddress() {
    this.newAddressName = '';
    this.newAddressAccount = '';
    this.activePanel = 0;
  }

  async deleteAddress(account) {
    try {
      await this.addressBookService.deleteAddress(account);
      this.notificationService.sendSuccess(`Successfully deleted address book entry`)
    } catch (err) {
      this.notificationService.sendError(`Unable to delete entry: ${err.message}`)
    }
  }

}
