# PositionUpdate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [optional] [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**quantity** | [**Quantity**](Quantity.md) |  | [optional] [default to undefined]
**unit** | **string** |  | [optional] [default to undefined]
**nomenclature_id** | **number** |  | [optional] [default to undefined]
**technical_requirements** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**status** | [**PositionStatus**](PositionStatus.md) |  | [optional] [default to undefined]
**price_per_unit** | [**PricePerUnit**](PricePerUnit.md) |  | [optional] [default to undefined]
**total_price** | [**TotalPrice**](TotalPrice.md) |  | [optional] [default to undefined]

## Example

```typescript
import { PositionUpdate } from '@tenderflow/api-client';

const instance: PositionUpdate = {
    name,
    description,
    quantity,
    unit,
    nomenclature_id,
    technical_requirements,
    status,
    price_per_unit,
    total_price,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
