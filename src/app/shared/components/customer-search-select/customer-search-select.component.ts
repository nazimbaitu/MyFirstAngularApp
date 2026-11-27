import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject } from '@angular/core';
import { Customer } from '../../../core/models/customer.model';
import { CalcService } from '../../../core/services/calc.service';
import { fmtAmount } from '../../../core/utils/formatters';

@Component({
  selector: 'app-customer-search-select',
  standalone: true,
  template: `
    <div class="customer-search-select">
      <input
        type="search"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        [attr.aria-expanded]="isOpen"
        [value]="searchText"
        placeholder="Search by name or mobile"
        (focus)="open()"
        (input)="onInput($event)"
        (keydown)="onKeyDown($event)">
      @if (isOpen) {
        <div class="customer-search-options" role="listbox">
          @for (customer of filteredCustomers; track customer.id; let i = $index) {
            <button type="button" class="customer-search-option"
              [class.active]="i === activeIndex"
              role="option"
              [attr.aria-selected]="customer.id === selectedCustomerId"
              (mouseenter)="activeIndex = i"
              (click)="select(customer)">
              <span class="customer-search-details">
                <strong>{{ customer.name }}</strong>
                <small>{{ customer.mobile }}</small>
              </span>
              <span class="customer-search-balance">{{ balance(customer) }}</span>
            </button>
          } @empty {
            <p class="customer-search-empty">No customers found.</p>
          }
        </div>
      }
    </div>
  `,
})
export class CustomerSearchSelectComponent implements OnChanges, OnDestroy {
  @Input() customers: Customer[] = [];
  @Input() selectedCustomerId = '';
  @Output() selectedCustomerIdChange = new EventEmitter<string>();

  private readonly calc = inject(CalcService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;
  searchText = '';
  filterTerm = '';
  isOpen = false;
  activeIndex = 0;
  private isEditing = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedCustomerId'] && !this.isEditing) {
      const selected = this.customers.find(customer => customer.id === this.selectedCustomerId);
      this.searchText = selected?.name ?? '';
      this.filterTerm = this.searchText.trim().toLocaleLowerCase();
    }
  }

  ngOnDestroy(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  get filteredCustomers(): Customer[] {
    if (!this.filterTerm) return this.customers;
    return this.customers.filter(customer =>
      customer.name.toLocaleLowerCase().includes(this.filterTerm) ||
      customer.mobile.toLocaleLowerCase().includes(this.filterTerm));
  }

  balance(customer: Customer): string {
    return fmtAmount(this.calc.customerBalance(customer.id));
  }

  open(): void {
    this.isOpen = true;
    this.activeIndex = 0;
  }

  onInput(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.isEditing = true;
    this.isOpen = true;
    this.activeIndex = 0;
    const selected = this.customers.find(customer => customer.id === this.selectedCustomerId);
    if (selected && this.searchText !== selected.name) this.selectedCustomerIdChange.emit('');
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filterTerm = this.searchText.trim().toLocaleLowerCase();
      this.activeIndex = 0;
    }, 200);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen = false;
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isOpen = true;
      this.activeIndex = Math.min(this.activeIndex + 1, this.filteredCustomers.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
    } else if (event.key === 'Enter' && this.isOpen) {
      event.preventDefault();
      const customer = this.filteredCustomers[this.activeIndex];
      if (customer) this.select(customer);
    }
  }

  select(customer: Customer): void {
    this.searchText = customer.name;
    this.filterTerm = customer.name.toLocaleLowerCase();
    this.isEditing = false;
    this.selectedCustomerIdChange.emit(customer.id);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.elementRef.nativeElement.contains(event.target)) this.isOpen = false;
  }
}
