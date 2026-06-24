package com.nearfix.booking.mapper;

import com.nearfix.booking.dto.BookingResponse;
import com.nearfix.booking.dto.CreateBookingRequest;
import com.nearfix.booking.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customerId", ignore = true)
    @Mapping(target = "workerId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "workerLocation", ignore = true)
    @Mapping(target = "distance", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "amount", ignore = true)
    Booking toEntity(CreateBookingRequest request);

    @Mapping(target = "id", source = "id")
    @Mapping(target = "bookingId", source = "id")
    @Mapping(target = "customerId", source = "customerId")
    @Mapping(target = "workerId", source = "workerId")
    @Mapping(target = "serviceType", source = "serviceType")
    @Mapping(target = "issueDescription", source = "issueDescription")
    @Mapping(target = "address", source = "address")
    @Mapping(target = "city", source = "city")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "workerLatitude", source = "workerLocation", qualifiedByName = "parseLat")
    @Mapping(target = "workerLongitude", source = "workerLocation", qualifiedByName = "parseLon")
    @Mapping(target = "workerLocation", source = "workerLocation")
    @Mapping(target = "distance", source = "distance")
    @Mapping(target = "amount", source = "amount")
    BookingResponse toResponse(Booking booking);

    @Named("parseLat")
    default Double parseLat(String workerLocation) {
        if (workerLocation == null) return null;
        Double[] coords = parseCoordinates(workerLocation);
        return coords != null ? coords[0] : null;
    }

    @Named("parseLon")
    default Double parseLon(String workerLocation) {
        if (workerLocation == null) return null;
        Double[] coords = parseCoordinates(workerLocation);
        return coords != null ? coords[1] : null;
    }

    default Double[] parseCoordinates(String addressStr) {
        if (addressStr == null) return null;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(-?\\d+\\.\\d+)\\s*°?\\s*([NSEW]?)");
        java.util.regex.Matcher matcher = pattern.matcher(addressStr);
        Double lat = null;
        Double lon = null;
        if (matcher.find()) {
            lat = Double.parseDouble(matcher.group(1));
            String dir = matcher.group(2);
            if ("S".equalsIgnoreCase(dir)) {
                lat = -Math.abs(lat);
            }
        }
        if (matcher.find()) {
            lon = Double.parseDouble(matcher.group(1));
            String dir = matcher.group(2);
            if ("W".equalsIgnoreCase(dir)) {
                lon = -Math.abs(lon);
            }
        }
        if (lat != null && lon != null) {
            return new Double[]{lat, lon};
        }
        return null;
    }
}
