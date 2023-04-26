import { Pipe, PipeTransform } from '@angular/core';
import { Inventory } from '@shared/classes/plant';

@Pipe({
  name: 'localInventory'
})
export class LocalInventoryPipe implements PipeTransform {

  transform(inventory: Inventory[]): Inventory[] {
    return inventory?.filter(storage => storage.type === 'local') ?? [];
  }

}
