# PositionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**quantity** | **string** |  | [optional] [default to '1.0']
**unit** | **string** |  | [optional] [default to 'шт']
**nomenclature_id** | **number** |  | [optional] [default to undefined]
**technical_requirements** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**price_per_unit** | **string** |  | [optional] [default to undefined]
**total_price** | **string** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to 'RUB']
**id** | **number** |  | [default to undefined]
**tender_id** | **number** |  | [default to undefined]
**status** | [**PositionStatus**](PositionStatus.md) |  | [default to undefined]
**created_at** | **string** |  | [default to undefined]
**updated_at** | **string** |  | [default to undefined]

## Example

```typescript
import { PositionResponse } from '@tenderflow/api-client';

const instance: PositionResponse = {
    name,
    description,
    quantity,
    unit,
    nomenclature_id,
    technical_requirements,
    price_per_unit,
    total_price,
    currency,
    id,
    tender_id,
    status,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
