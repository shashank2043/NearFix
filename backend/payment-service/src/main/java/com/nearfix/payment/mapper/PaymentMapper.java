package com.nearfix.payment.mapper;

import com.nearfix.payment.dto.PaymentResponse;
import com.nearfix.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "keyId", source = "keyId")
    PaymentResponse toResponse(Payment payment, String keyId);
}
