# TenderResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**number** | **string** |  | [default to undefined]
**title** | **string** |  | [default to undefined]
**customer** | **string** |  | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**source** | [**TenderSource**](TenderSource.md) |  | [optional] [default to undefined]
**source_url** | **string** |  | [optional] [default to undefined]
**deadline_at** | **string** |  | [default to undefined]
**published_at** | **string** |  | [optional] [default to undefined]
**initial_max_price** | **string** |  | [optional] [default to undefined]
**currency** | **string** |  | [optional] [default to 'RUB']
**terms** | **{ [key: string]: any; }** |  | [optional] [default to undefined]
**responsible_id** | **number** |  | [optional] [default to undefined]
**engineer_id** | **number** |  | [optional] [default to undefined]
**id** | **number** |  | [default to undefined]
**stage_id** | **number** |  | [default to undefined]
**stage** | [**StageResponse**](StageResponse.md) |  | [optional] [default to undefined]
**positions** | [**Array&lt;PositionResponse&gt;**](PositionResponse.md) |  | [optional] [default to undefined]
**files** | [**Array&lt;TenderFileResponse&gt;**](TenderFileResponse.md) |  | [optional] [default to undefined]
**audit_logs** | [**Array&lt;AuditLogResponse&gt;**](AuditLogResponse.md) |  | [optional] [default to undefined]
**is_archived** | **boolean** |  | [default to undefined]
**created_at** | **string** |  | [default to undefined]
**updated_at** | **string** |  | [default to undefined]

## Example

```typescript
import { TenderResponse } from '@tenderflow/api-client';

const instance: TenderResponse = {
    number,
    title,
    customer,
    description,
    source,
    source_url,
    deadline_at,
    published_at,
    initial_max_price,
    currency,
    terms,
    responsible_id,
    engineer_id,
    id,
    stage_id,
    stage,
    positions,
    files,
    audit_logs,
    is_archived,
    created_at,
    updated_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
