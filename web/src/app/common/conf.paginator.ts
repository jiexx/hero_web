import { MatPaginatorIntl } from '@angular/material';

export function ConfPaginator() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = '每页:';
  paginatorIntl.getRangeLabel = (/**
    * @param {?} page
    * @param {?} pageSize
    * @param {?} length
    * @return {?}
    */
   (page, pageSize, length) => {
       if (length == 0 || pageSize == 0) {
           return `0 of ${length}`;
       }
       length = Math.max(length, 0);
       /** @type {?} */
       const startIndex = page * pageSize;
       // If the start index exceeds the list length, do not try and fix the end index to the end.
       /** @type {?} */
       const endIndex = startIndex < length ?
           Math.min(startIndex + pageSize, length) :
           startIndex + pageSize;
       return `${startIndex + 1} - ${endIndex} 共 ${length}`;
   });

  return paginatorIntl;
}